import api from '@/api/api';

export default {
    getNotifications(){ 
        return api.get("/notifications");  
    }, 
    sendNotifications() {
        return api.post("/sendNotifications");
    },
    deleteNotification(id) {
        return api.delete(`/notifications/${id}`);
    }
};