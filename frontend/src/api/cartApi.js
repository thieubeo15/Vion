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
    
    // Cart Item
    addItem(data) {
        // data cần có: { CartID, VariantID, Quantity }
        return axiosClient.post('/cart-items', data);
    },
    updateItemQuantity(id, data) {
        // data: { Quantity }
        return axiosClient.put(`/cart-items/${id}`, data);
    },
    removeItem(id) {
        return axiosClient.delete(`/cart-items/${id}`);
    }
};
