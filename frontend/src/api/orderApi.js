import axiosClient from './axiosClient';

export const orderApi = {
    createOrder(data) {
        
        return axiosClient.post('/orders', data);
    },
    getOrderDetails(id) {
        return axiosClient.get(`/orders/${id}`);
    },
    updateOrderStatus(id, data) {
        return axiosClient.put(`/orders/${id}`, data);
    },
};

