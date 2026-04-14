import axiosClient from './axiosClient';

export const userApi = {
    getMe(id) {
        return axiosClient.get(`/users/${id}`);
    },
    updateProfile(id, data) {
        return axiosClient.put(`/users/${id}`, data);
    }
};

export const reviewApi = {
    getReviews() {
        return axiosClient.get('/reviews');
    },
    addReview(data) {
        return axiosClient.post('/reviews', data);
    }
};
