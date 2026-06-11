import api from "../axios";

export const register = (userData) => {
    return api.post("/api/auth/register/", userData);
};

export const login = (userData) => {
    return api.post("/api/auth/login/", userData);
}

export const forgotPassword = (email) => {
    return api.post("/api/auth/password-reset/", { email } );
}

export const resetPassword = (data) => {
    return api.post("/api/auth/password-reset-confirm/", data);
}