
## Cấu trúc thư mục dự án
*   **/frontend**: Giao diện phía người dùng (React.js + Vite + Bootstrap 5).
*   **/backend**: Máy chủ dịch vụ API (Laravel 11 + MySQL).
*   **/backend/ai_service**: Các dịch vụ AI chạy bằng Python FastAPI.

---

## Yêu cầu hệ thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã được cài đặt đầy đủ các công cụ sau:
*   PHP >= 8.2 (Khuyên dùng Laragon hoặc XAMPP)
*   Composer (Trình quản lý thư viện PHP)
*   Node.js >= 18.0 & npm
*   Python >= 3.10 (Để chạy các dịch vụ AI)
*   MySQL Database (Hỗ trợ JSON column để lưu vector)
*   (Tùy chọn) Ollama nếu muốn chạy mô hình ngôn ngữ lớn (LLM) offline cục bộ.

---

## Hướng dẫn cài đặt chi tiết

### Bước 1: Khởi tạo và Nhập dữ liệu Cơ sở dữ liệu (MySQL)
1. Mở phần mềm quản trị CSDL của bạn (ví dụ: phpMyAdmin, HeidiSQL từ Laragon, TablePlus...).
2. Tạo một cơ sở dữ liệu mới có tên là: `vion` với bảng mã (Collation) là `utf8mb4_unicode_ci`.
3. Nhập dữ liệu từ tệp tin backup `vion_backup.sql` (nằm ở thư mục gốc của dự án) vào cơ sở dữ liệu `vion`:
   * **Cách 1: Sử dụng dòng lệnh (Khuyên dùng - Nhanh nhất)**
     Mở terminal/cmd tại thư mục gốc của dự án và chạy lệnh sau (hãy đổi `123456` thành mật khẩu MySQL của bạn, nếu không có mật khẩu thì bỏ `-p123456` đi):
     ```bash
     mysql -u root -p123456 vion < vion_backup.sql
     ```
   * **Cách 2: Sử dụng giao diện Laragon (HeidiSQL)**
     * Nhấn nút **Database** trong Laragon để mở HeidiSQL, click chuột phải vào kết nối và chọn **Create new** -> **Database** -> Đặt tên là `vion` -> Chọn Collation `utf8mb4_unicode_ci`.
     * Chọn database `vion` vừa tạo ở danh sách bên trái.
     * Chọn menu **File** -> **Load SQL file...** -> Chọn file `vion_backup.sql`.
     * Nhấn nút **Run** (biểu tượng tam giác màu xanh trên thanh công cụ hoặc nhấn phím `F9`) để thực thi import dữ liệu.
   * **Cách 3: Sử dụng phpMyAdmin**
     * Truy cập `http://localhost/phpmyadmin` trên trình duyệt.
     * Click vào **New** ở cột bên trái để tạo database, nhập tên `vion`, chọn `utf8mb4_unicode_ci` rồi nhấn **Create**.
     * Click chọn database `vion` vừa tạo, sau đó chọn thẻ **Import** (Nhập) ở thanh công cụ phía trên.
     * Tại mục **File to import** (Tệp để nhập), chọn **Choose File** (Chọn tệp) và trỏ tới file `vion_backup.sql` ở thư mục dự án.
     * Kéo xuống dưới cùng và nhấn nút **Import** (hoặc **Go** / **Thực thi**).
   * **Cách 4: Sử dụng TablePlus**
     * Mở TablePlus và kết nối tới server MySQL của bạn.
     * Click chuột phải vào danh sách database, chọn **New...** -> Tạo database `vion`.
     * Nhấn tổ hợp phím `Ctrl + D` (hoặc `Cmd + D` trên Mac) và chọn kết nối database `vion`.
     * Chọn menu **File** -> **Restore...** -> Chọn tệp tin `vion_backup.sql` rồi nhấn **Start restore**.

> [!IMPORTANT]
> Tệp tin `vion_backup.sql` chứa các câu lệnh `DROP TABLE IF EXISTS`, do đó nếu database `vion` của bạn đã có dữ liệu từ trước, thao tác nhập này sẽ xóa sạch các bảng cũ để ghi đè dữ liệu mẫu mới từ file backup.


---

### Bước 2: Cài đặt và cấu hình Backend (Laravel)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện PHP qua Composer:
   ```bash
   composer install
   ```
3. Tạo file cấu hình môi trường `.env`:
   * Sao chép file mẫu `.env.example` thành `.env`:
     ```bash
     cp .env.example .env
     ```
   * Mở file `.env` vừa tạo và chỉnh sửa cấu hình kết nối CSDL và khóa API:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=vion
     DB_USERNAME=root      # Username MySQL của bạn
     DB_PASSWORD=          # Mật khẩu MySQL của bạn (nếu không có thì để trống)

     # Cấu hình API Key cho Chatbot AI (Lấy key miễn phí từ Google AI Studio)
     GEMINI_API_KEY=your_gemini_api_key_here

     # (Tùy chọn) Cấu hình chạy AI bằng Ollama Local
     OLLAMA_MODEL=qwen2.5:3b
     OLLAMA_BASE_URL=http://localhost:11434
     ```
4. Khởi tạo mã khóa ứng dụng (Application Key):
   ```bash
   php artisan key:generate
   ```
5. Chạy các lệnh migrate để tạo bảng và nạp dữ liệu mẫu (Seeder):
   ```bash
   php artisan migrate --seed
   ```
6. Tạo liên kết lưu trữ để hiển thị ảnh sản phẩm:
   ```bash
   php artisan storage:link
   ```
7. Khởi chạy máy chủ Laravel Backend:
   ```bash
   php artisan serve
   ```
   *Mặc định backend sẽ khởi chạy tại địa chỉ:* `http://127.0.0.1:8000`

---

### Bước 3: Cài đặt và chạy các Dịch vụ AI (Python FastAPI)
Các dịch vụ AI tự động đọc cấu hình kết nối CSDL và API Key từ file `.env` của Laravel bên ngoài.

1. Di chuyển vào thư mục dịch vụ AI:
   ```bash
   cd backend/ai_service
   ```
2. Kích hoạt môi trường ảo Python có sẵn (`venv`):
   * **Trên Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Trên Windows (Command Prompt - CMD):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **Trên macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
3. (Nếu chưa cài đặt thư viện) Cài đặt các gói Python cần thiết:
   ```bash
   pip install uvicorn fastapi pymysql python-dotenv torch torchvision transformers pillow langchain langchain-community langchain-ollama langchain-google-genai
   ```
4. Khởi chạy Dịch vụ tìm kiếm hình ảnh (CLIP Vectorizer) chạy ở cổng `8001`:
   ```bash
   python clip_service.py
   ```
5. Mở một terminal mới (kích hoạt venv) và khởi chạy Dịch vụ Trợ lý ảo tư vấn (Chatbot RAG) chạy ở cổng `8002`:
   ```bash
   python chatbot_service.py
   ```

---

### Bước 4: Cài đặt và cấu hình Frontend (React.js + Vite)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện Node.js:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển Frontend:
   ```bash
   npm run dev
   ```
   *Trình duyệt sẽ tự động mở trang web tại địa chỉ:* `http://localhost:5173` (hoặc cổng được Vite cung cấp).

---

## Kiểm tra hoạt động của hệ thống
Sau khi hoàn thành tất cả các bước trên, hãy kiểm tra hệ thống thông qua các cổng dịch vụ đang chạy song song:
1. **Frontend (Giao diện mua sắm):** `http://localhost:5173`
2. **Laravel Backend API:** `http://127.0.0.1:8000`
3. **Dịch vụ AI CLIP (Trích xuất ảnh):** `http://127.0.0.1:8001`
4. **Dịch vụ AI Chatbot (Tư vấn):** `http://127.0.0.1:8002`

---

## Tài khoản thử nghiệm (Demo Accounts)

Để kiểm tra các chức năng của hệ thống, bạn có thể sử dụng các tài khoản mẫu sau:

### 1. Tài khoản Quản trị viên (Admin)
*   **Email:** `admin@gmail.vn`
*   **Mật khẩu:** `123456`

### 2. Tài khoản Khách hàng (Customer)
*   **Email:** `kh1@gmail.com`
*   **Mật khẩu:** `123456`