import io
import uvicorn # 🚀 THÊM THƯ VIỆN NÀY ĐỂ CHẠY SERVER
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import numpy as np

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

def autocrop_image(image: Image.Image, tolerance=25) -> Image.Image:
    """
    Tự động cắt phông nền (autocrop) để loại bỏ nhiễu phông nền của studio e-commerce.
    """
    try:
        # Chuyển ảnh sang dạng numpy array
        img_np = np.array(image.convert("RGB"))
        h, w, c = img_np.shape
        
        # Lấy các điểm ở 4 góc để ước lượng màu nền trung bình
        corners = np.array([
            img_np[0, 0],
            img_np[0, -1],
            img_np[-1, 0],
            img_np[-1, -1]
        ])
        bg_color = np.mean(corners, axis=0)
        
        # Tính khoảng cách từ mỗi pixel đến màu nền
        diff = img_np - bg_color
        dist = np.sqrt(np.sum(diff ** 2, axis=-1))
        
        # Tìm các pixel khác màu nền (vật thể chính)
        non_bg_mask = dist > tolerance
        
        if not np.any(non_bg_mask):
            return image
            
        # Lấy tọa độ bounding box của vật thể
        rows = np.any(non_bg_mask, axis=1)
        cols = np.any(non_bg_mask, axis=0)
        
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # Chuyển về kiểu dữ liệu int tiêu chuẩn của Python để tránh lỗi thư viện Pillow
        ymin, ymax = int(ymin), int(ymax)
        xmin, xmax = int(xmin), int(xmax)
        
        # Thêm padding khoảng 6% để tránh việc cắt sát quá viền sản phẩm
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
        # Đọc dữ liệu ảnh và chuyển về hệ màu RGB chuẩn
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Áp dụng tự động cắt phông nền
        pil_image = autocrop_image(pil_image)
        
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