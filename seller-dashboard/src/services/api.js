import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Automatically attach seller JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("next360-token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle expired/invalid token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("next360-token");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;