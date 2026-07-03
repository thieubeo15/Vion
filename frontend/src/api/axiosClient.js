import axios from 'axios';


const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});


axiosClient.interceptors.request.use(
    (config) => {
        
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


axiosClient.interceptors.response.use(
    (response) => {
        return response.data; 
    },
    (error) => {
        
        if (error.response && error.response.status === 401) {
            
            localStorage.removeItem('access_token');
            
            
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
