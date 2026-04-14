import axiosClient from './axiosClient';

export const productApi = {
    getAll() {
        return axiosClient.get('/products');
    },
    getById(id) {
        return axiosClient.get(`/products/${id}`);
    },
    // Các thao tác variant, vector, image (Nếu có admin thì post/put/delete)
};
