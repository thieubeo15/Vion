import axiosClient from './axiosClient';

export const cartApi = {
    getAllCart() {
        return axiosClient.get('/carts');
    },
    createCart(data) {
        return axiosClient.post('/carts', data);
    },
    getCartDetails(id) {
        return axiosClient.get(`/carts/${id}`);
    },
    
    
    addItem(data) {
        
        return axiosClient.post('/cart-items', data);
    },
    updateItemQuantity(id, data) {
        
        return axiosClient.put(`/cart-items/${id}`, data);
    },
    removeItem(id) {
        return axiosClient.delete(`/cart-items/${id}`);
    }
};
