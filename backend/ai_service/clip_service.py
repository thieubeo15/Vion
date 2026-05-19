import io
import uvicorn # 🚀 THÊM THƯ VIỆN NÀY ĐỂ CHẠY SERVER
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

app = FastAPI(title="Vion Era CLIP AI Service")

# Bật CORS để Laravel ở cổng 8000 gọi sang không bị chặn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tải mô hình CLIP từ HuggingFace
MODEL_NAME = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(MODEL_NAME)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)

@app.post("/vectorize")
async def vectorize_image(image: UploadFile = File(...)):
    try:
        # Đọc dữ liệu ảnh và chuyển về hệ màu RGB chuẩn
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Biến đổi ảnh thành dạng Tensor toán học qua CLIP
        inputs = processor(images=pil_image, return_tensors="pt")
        with torch.no_grad():
            # 1. Gọi mô hình lấy đặc trưng hình ảnh
            if hasattr(model, 'get_image_features'):
                outputs = model.get_image_features(**inputs)
            else:
                outputs = model(**inputs)
            
            # 2. XỬ LÝ DỰA TRÊN SỐ CHIỀU (SHAPE-AWARE)
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
            
        # Chuẩn hóa ma trận Vector (L2 Norm)
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
        
        # Chuyển ma trận toán học về mảng JSON thông thường (512 số thực)
        vector_list = image_features[0].tolist()
        
        return {"success": True, "vector": vector_list}
    except Exception as e:
        return {"success": False, "message": str(e)}

# 🚀 CỤM KÍCH HOẠT ĐỘNG CƠ: Giữ máy chủ liên tục lắng nghe ở cổng 8001
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)