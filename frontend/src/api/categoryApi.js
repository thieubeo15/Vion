import axiosClient from './axiosClient';

export const categoryApi = {
    getAll() {
        return axiosClient.get('/categories');
    },
    getById(id) {
        return axiosClient.get(`/categories/${id}`);
    }
};
