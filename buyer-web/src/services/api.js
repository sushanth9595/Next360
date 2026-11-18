import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("next360-token");

            if (window.location.pathname !== "/login") {
                alert("Your session has expired. Please login again.");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;