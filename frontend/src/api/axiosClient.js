import axios from 'axios';

// Định nghĩa base URL của Laravel Backend API
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api', // Laravel thường chạy port 8000
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor cho Request (Trước khi gọi API)
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage nếu có, nhét vào Header Authorization
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho Response (Sau khi gọi API có kết quả trả về)
axiosClient.interceptors.response.use(
    (response) => {
        return response.data; // Chỉ lấy phần data của response cho gọn
    },
    (error) => {
        // Xử lý chung các lỗi mạng, lỗi trả về
        if (error.response && error.response.status === 401) {
            // Unauthenticated - Xoá token nếu token hết hạn/lỗi
            localStorage.removeItem('access_token');
            // Có thể reload hoặc redirect về trang login tuỳ ý
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
