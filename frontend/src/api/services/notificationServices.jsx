import api from "../axios";

export const getNotifications = () => {
    return api.get(`/api/notifications/`);
}

export const markAsRead = (id) => {
    return api.patch(`/api/notifications/${id}/read/`);
}

export const markAllRead = () => {
    return api.patch(`/api/notifications/mark-all-read/`);
}