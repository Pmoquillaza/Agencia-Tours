import axios from "axios";

const getApiBaseUrl = () => {
    const configuredUrl =
        import.meta.env.VITE_API_URL?.trim();

    if (!configuredUrl) {
        return import.meta.env.DEV
            ? "http://localhost:3000/api"
            : "/api";
    }

    if (
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        configuredUrl.startsWith("http://")
    ) {
        try {
            const url = new URL(configuredUrl);

            if (url.hostname === window.location.hostname) {
                return url.pathname || "/api";
            }

            url.protocol = "https:";

            return url.toString();
        } catch {
            return "/api";
        }
    }

    return configuredUrl;
};

const api = axios.create({

    baseURL: getApiBaseUrl(),

    headers: {

        "Content-Type": "application/json"

    }

});

// =====================================
// INTERCEPTOR JWT
// =====================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);

export default api;
