import io

import uvicorn                                     

from fastapi import FastAPI, UploadFile, File

from fastapi.middleware.cors import CORSMiddleware

from PIL import Image

import torch

from transformers import CLIPProcessor, CLIPModel

import numpy as np


app = FastAPI(title="Vion Era CLIP AI Service")
                                                   

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)
                             
MODEL_NAME = "openai/clip-vit-base-patch32"

model = CLIPModel.from_pretrained(MODEL_NAME)

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
                                        

representative_prompts = [

    "a photo of a shirt, hoodie, t-shirt, polo, jacket, top or sweater",           

    "a photo of pants, jeans, shorts, joggers or trousers",                         

    "a photo of a dress, skirt or gown",                                           

    "a photo of a hat, cap, beanie, bag, shoes or accessory"                        

]

with torch.no_grad():

    inputs_text = processor(text=representative_prompts, return_tensors="pt", padding=True)

    res_text = model.get_text_features(**inputs_text)

    if isinstance(res_text, torch.Tensor):

        text_features = res_text

    elif hasattr(res_text, 'text_embeds'):

        text_features = res_text.text_embeds

    elif hasattr(res_text, 'pooler_output'):

        text_features = res_text.pooler_output

    else:

        text_features = res_text[0]
                        
    text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)

def autocrop_image(image: Image.Image, tolerance=25) -> Image.Image:

    """
    Tự động cắt phông nền (autocrop) để loại bỏ nhiễu phông nền của studio e-commerce.
    """

    try:
                                  
        img_np = np.array(image.convert("RGB"))

        h, w, c = img_np.shape

        corners = np.array([

            img_np[0, 0],

            img_np[0, -1],

            img_np[-1, 0],

            img_np[-1, -1]

        ])

        bg_color = np.mean(corners, axis=0)

        diff = img_np - bg_color

        dist = np.sqrt(np.sum(diff ** 2, axis=-1))

        non_bg_mask = dist > tolerance

        if not np.any(non_bg_mask):

            return image
           
        rows = np.any(non_bg_mask, axis=1)

        cols = np.any(non_bg_mask, axis=0)
        
        ymin, ymax = np.where(rows)[0][[0, -1]]

        xmin, xmax = np.where(cols)[0][[0, -1]]
                                                                               
        ymin, ymax = int(ymin), int(ymax)

        xmin, xmax = int(xmin), int(xmax)                                                         

        pad_y = int((ymax - ymin) * 0.06)

        pad_x = int((xmax - xmin) * 0.06)
        
        ymin = max(0, ymin - pad_y)

        ymax = min(h, ymax + pad_y)

        xmin = max(0, xmin - pad_x)

        xmax = min(w, xmax + pad_x)

        if ymax > ymin and xmax > xmin:

            cropped = image.crop((xmin, ymin, xmax, ymax))

            print(f"[Autocrop] Size changed from {image.size} to {cropped.size}")

            return cropped

    except Exception as e:

        print(f"[Autocrop] Error: {e}")

    return image

@app.post("/vectorize")

async def vectorize_image(image: UploadFile = File(...)):

    try:                                              

        image_data = await image.read()

        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
                              

        pil_image = autocrop_image(pil_image)
                                               

        inputs = processor(images=pil_image, return_tensors="pt")

        with torch.no_grad():
                                      

            if hasattr(model, 'get_image_features'):

                outputs = model.get_image_features(**inputs)

            else:

                outputs = model(**inputs)
                                                      

            if isinstance(outputs, torch.Tensor):

                if outputs.shape[-1] == 768 and hasattr(model, 'visual_projection'):

                    image_features = model.visual_projection(outputs)

                else:

                    image_features = outputs

            else:

                if hasattr(outputs, 'image_embeds'):

                    image_features = outputs.image_embeds

                elif hasattr(outputs, 'pooler_output'):

                    if outputs.pooler_output.shape[-1] == 768 and hasattr(model, 'visual_projection'):

                        image_features = model.visual_projection(outputs.pooler_output)

                    else:

                        image_features = outputs.pooler_output

                else:

                    image_features = outputs                             

        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
                                            

        similarities = (image_features @ text_features.T).squeeze(0)

        best_idx = similarities.argmax().item()

        categories_list = ["ao", "quan", "vay", "khac"]

        predicted_category = categories_list[best_idx]

        vector_list = image_features[0].tolist()

        return {

            "success": True, 

            "vector": vector_list, 

            "category": predicted_category

        }

    except Exception as e:

        return {"success": False, "message": str(e)}                                                            

if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=8001)
