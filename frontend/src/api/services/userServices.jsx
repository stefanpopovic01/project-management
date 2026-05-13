import api from "../axios";

export const getUser = (id) => {
    return api.get(`/user/${id}`);
}

export const getFollowers = (id) => {
    return api.get(`/user/followers/${id}`);
}

export const getFollowing = (id) => {
    return api.get(`/user/following/${id}`);
}

export const editUser = (id, form) => {
    return api.patch(`/user/${id}`, form);
}

export const follow = (id) => {
    return api.patch(`/user/follow/${id}`);
}

export const unfollow = (id) => {
    return api.patch(`/user/unfollow/${id}`);
}

export const getUsers = (search = "") => {
    return api.get(`/api/auth/search/`, {
        params: { 
            q: search
        }
    });
};

// http://127.0.0.1:8000/api/auth/login/