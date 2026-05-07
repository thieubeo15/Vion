import axiosClient from './axiosClient';

export const chatApi = {
    getUserMessages(userId) {
        return axiosClient.get(`/messages/user/${userId}`);
    },
    sendMessage(data) {
        // data: { UserID, Sender, Content, SentAt }
        return axiosClient.post('/messages', data);
    }
};
