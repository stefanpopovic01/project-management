import axios from "axios";

let sessionExpiredHandler = null;

export const setSessionExpiredHandler = (handler) => {
    sessionExpiredHandler = handler;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
            console.log("[REQUEST]", config.method.toUpperCase(), config.url);
            console.log("[DATA]", config.data);
            console.log("[HEADERS]", config.headers);
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) console.error("[REQUEST ERROR]", error);  
        return Promise.reject(error); 
    }
);

api.interceptors.response.use(
    (response) => {

        if (import.meta.env.DEV) {
            console.log("[RESPONSE]", response.status, response.config.url);
            console.log("[DATA]", response.data);
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isLoginRequest = originalRequest.url?.includes("/api/auth/login/") || originalRequest.url?.includes("/login");

        if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
            if (import.meta.env.DEV) console.error("[401] Unauthorized — token missing or expired.");
            originalRequest._retry = true; 

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token available.");

                const response = await api.post("/api/auth/token/refresh/", {
                    refresh: refreshToken,
                });

                const newAccessToken = response.data.access;
                localStorage.setItem("accessToken", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest); 
                
            } catch (refreshError) {
                if (import.meta.env.DEV) console.error("[REFRESH FAILED] Refresh token is also expired or invalid.");
                
                if (sessionExpiredHandler) {
                    sessionExpiredHandler(true);
                }
                return Promise.reject(refreshError);
            }
        }

        if (import.meta.env.DEV) {
            if (error.response?.status === 401 && isLoginRequest) {
                console.warn("[LOGIN FAILED] Incorrect credentials entered.");
            }
            if (error.response?.status === 403) console.error("[403] Forbidden — no permission.");
            if (error.response?.status === 404) console.error("[404] Not found.");
            if (error.response?.status === 500) console.error("[500] Server error!");
            if (!error.response) console.error("[NETWORK ERROR] Connection error.");
            if (error.code === "ECONNABORTED") console.error("[TIMEOUT] Server timed out.");

            console.error("[ERROR]", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                url: error.config?.url,
            });
        }

        return Promise.reject(error);  
    }
);

export default api;