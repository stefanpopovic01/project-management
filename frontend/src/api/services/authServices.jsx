import api from "../axios";

export const register = (userData) => {
    return api.post("/auth/register", userData);
};

export const login = (userData) => {
    return api.post("/api/auth/login/", userData);
}