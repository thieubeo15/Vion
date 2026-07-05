##  Cấu Trúc Thư Mục Dự Án
*   `frontend/`: Giao diện người dùng (React.js + Vite + Bootstrap 5).
*   `backend/`: Máy chủ API và quản trị (Laravel 11 + MySQL).
*   `backend/ai_service/`: Các dịch vụ AI chạy bằng Python FastAPI.
---
##  Yêu Cầu Hệ Thống
Đảm bảo máy tính của bạn đã cài đặt các công cụ sau trước khi bắt đầu:
1.  **PHP >= 8.2** & **Composer** (Khuyên dùng [Laragon](https://laragon.org/) hoặc XAMPP trên Windows).
2.  **Node.js >= 18.0** & **npm**.
3.  **Python >= 3.10** (Để chạy các dịch vụ AI).
4.  **MySQL Database** (Hỗ trợ định dạng JSON để lưu trữ vector sản phẩm).
5.  *(Tùy chọn)* **Ollama** nếu muốn chạy Chatbot AI Offline (không cần mạng và API Key).
---
##  Hướng Dẫn Cài Đặt Chi Tiết

###  Bước 1: Khởi Tạo Cơ Sở Dữ Liệu (MySQL)
1.  Mở phần mềm quản trị CSDL của bạn (HeidiSQL, phpMyAdmin, TablePlus...).
2.  Tạo một cơ sở dữ liệu mới:
Nếu dùng Laragon : Nhấn nút Database trên Laragon để mở HeidiSQL Tạo database vion với Collation là `utf8mb4_unicode_ci`. Chọn menu File -> Load SQL file... -> Chọn file .sql và nhấn F9 để chạy.
Nếu dùng XAMPP: Mở trình duyệt truy cập http://localhost/phpmyadmin -> Chọn database vion -> Chọn tab Import (Nhập) -> Chọn file .sql và nhấn Go (Thực thi).
---
###  Bước 2: Cài Đặt & Chạy Backend (Laravel)
1.  Mở terminal mới và di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các thư viện PHP:
    ```bash
    composer install
    ```
3.  Tạo file cấu hình môi trường `.env`:
    *   Sao chép file cấu hình mẫu:
        ```bash
       coppy file .env.example và đổi tên thành .env
        ```
    *   Mở file [`.env`]
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=vion
        DB_USERNAME=root
        DB_PASSWORD=your_mysql_password  # Thay bằng mật khẩu MySQL của bạn
        ```
4.  Khởi tạo khóa ứng dụng Laravel:
    ```bash
    php artisan key:generate
    ```
5.  Tạo liên kết lưu trữ để hiển thị hình ảnh sản phẩm:
    ```bash
    php artisan storage:link
    ```
6.  Chạy máy chủ Laravel API:
    ```bash
    php artisan serve
    ```
    *Mặc định Laravel API sẽ chạy tại địa chỉ:* `http://127.0.0.1:8000`

---

###  Bước 3: Cài Đặt & Chạy Các Dịch Vụ AI (Python FastAPI)
Các dịch vụ AI sẽ tự động đọc cấu hình database và khóa API từ file `.env` của Laravel bên ngoài.

1.  Mở một terminal mới và di chuyển vào thư mục dịch vụ AI:
    ```bash
    cd backend/ai_service
    ```
2.  **Khởi tạo môi trường ảo (venv) để tránh xung đột thư viện:**
    *   **Nếu bạn sử dụng Python cài độc lập trên máy (và đã thêm vào PATH):**
        ```powershell
        python -m venv venv
        ```
        **Mở quyền chạy script**
         ```powershell
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
        ```
3.  **Kích hoạt môi trường ảo vừa tạo:**
    *   **Trên Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
        *(Bạn sẽ thấy chữ `(venv)` xuất hiện ở đầu dòng lệnh).*
    *   **Trên Windows (CMD):**
        ```cmd
        .\venv\Scripts\activate.bat
        ```
    *   **Trên macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
4.  **Cài đặt các gói thư viện Python:**
    ```bash
    pip install uvicorn fastapi pymysql python-dotenv torch torchvision transformers pillow langchain langchain-community langchain-ollama langchain-google-genai
    
    pip install python-multipart
    ```
5.  **Cấu hình API Key cho Chatbot AI :**
        Tải ứng dụng [Ollama](https://ollama.com/), cài đặt và kéo mô hình `qwen2.5:3b` về máy:
         Vào CMD :
        ```bash
        ollama pull qwen2.5:3b
        ```
        ```bash
        ollama run qwen2.5:3b
        ```
       
        Sau đó cấu hình trong `.env` (để trống hoặc xóa dòng `GEMINI_API_KEY` đi):
        ```env
        OLLAMA_MODEL=qwen2.5:3b
        OLLAMA_BASE_URL=http://localhost:11434
        ```

7.  **Khởi chạy Dịch vụ tìm kiếm hình ảnh (CLIP Service - Cổng 8001):**
    ```bash
    python clip_service.py
    ```

8.  **Khởi chạy Dịch vụ Trợ lý ảo tư vấn (Chatbot Service - Cổng 8002):**
    Mở thêm một cửa sổ terminal mới, di chuyển vào thư mục `backend/ai_service`, kích hoạt `venv` (`.\venv\Scripts\Activate.ps1`) và chạy:
    ```bash
    python chatbot_service.py
    ```

---

###  Bước 4: Cài Đặt & Chạy Frontend (React.js)
1.  Mở terminal mới và di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các thư viện Node.js:
    ```bash
    npm install
    ```
3.  Khởi chạy giao diện phát triển:
    ```bash
    npm run dev
    ```
    *Trình duyệt sẽ tự động mở trang web mua sắm tại địa chỉ:* `http://localhost:5173`

---

##  Kiểm Tra Hoạt Động Của Hệ Thống
Khi tất cả các dịch vụ đã khởi chạy thành công, hệ thống của bạn sẽ chạy song song trên các cổng sau:
1.  **Frontend Giao diện:** `http://localhost:5173`
2.  **Laravel Backend API:** `http://127.0.0.1:8000`
3.  **Dịch vụ AI CLIP (Tìm kiếm ảnh):** `http://127.0.0.1:8001`
4.  **Dịch vụ AI Chatbot (Tư vấn):** `http://127.0.0.1:8002`

---

##  Tài Khoản Thử Nghiệm (Demo Accounts)
Sử dụng các tài khoản mẫu sau để đăng nhập và kiểm tra các chức năng của ứng dụng:

### 1. Tài khoản Quản trị viên (Admin - Quản lý sản phẩm, đơn hàng)
*   **Email:** `admin@gmail.vn`
*   **Mật khẩu:** `123456`

### 2. Tài khoản Khách hàng (Customer - Mua sắm, Chatbot AI)
*   **Email:** `kh1@gmail.com`
*   **Mật khẩu:** `123456`
