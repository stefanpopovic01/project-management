import api from "../axios";

export const getNotifications = () => {
    return api.get(`/notification/`);
}

export const markAsRead = (id) => {
    return api.patch(`/notification/${id}`);
}

export const markAllRead = () => {
    return api.patch(`/notification/read-all`);
}