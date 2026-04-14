import axiosClient from './axiosClient';

export const authApi = {
    login(data) {
        return axiosClient.post('/login', data);
    },
    register(data) {
        return axiosClient.post('/register', data);
    },
    logout() {
        return axiosClient.post('/logout');
    }
};
