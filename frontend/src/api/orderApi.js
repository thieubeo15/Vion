import axiosClient from './axiosClient';

export const orderApi = {
    createOrder(data) {
        // data: { UserID, OrderDate, TotalAmount, Status, details: [{VariantID, Quantity, Price}] }
        return axiosClient.post('/orders', data);
    },
    getOrderDetails(id) {
        return axiosClient.get(`/orders/${id}`);
    },
    updateOrderStatus(id, data) {
        return axiosClient.put(`/orders/${id}`, data);
    },

    // Thanh toán
    createPayment(data) {
        return axiosClient.post('/payments', data);
    }
};
