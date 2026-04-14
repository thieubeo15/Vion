import axiosClient from './axiosClient';

export const chatApi = {
    createSession(data) {
        // data: { UserID, StartTime }
        return axiosClient.post('/chat-sessions', data);
    },
    getSessionDetails(id) {
        return axiosClient.get(`/chat-sessions/${id}`);
    },
    sendMessage(data) {
        // data: { SessionID, Sender, Content, SentAt }
        return axiosClient.post('/messages', data);
    }
};
