import api from "../axios";

export const getUser = (id) => {
    return api.get(`/api/auth/user/${id}/`);
}

export const getFollowers = (id) => {
    return api.get(`/api/auth/user/${id}/followers/`);
}

export const getFollowing = (id) => {
    return api.get(`/api/auth/user/${id}/following/`);
}

export const editUser = (id, form) => {
    return api.patch(`/api/auth/user/${id}/`, form);
}

export const follow = (id) => {
    return api.post(`/api/auth/user/${id}/follow/`);
}

export const getUsers = (search = "") => {
    return api.get(`/api/auth/search/`, {
        params: { 
            q: search
        }
    });
};

