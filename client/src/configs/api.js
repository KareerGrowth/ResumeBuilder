import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // REQUEST LOGGING
    console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    if (config.data) console.log("[API PAYLOAD]:", config.data);

    return config;
});

api.interceptors.response.use(
    response => {
        console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
        // console.log("[API DATA]:", response.data); // Optional: verbose
        return response;
    },
    error => {
        console.error(`[API ERROR] ${error.config?.url}`, error.response ? error.response.status : "Network Error");
        if (error.response?.data) console.error("[API ERROR DATA]:", error.response.data);
        return Promise.reject(error);
    }
);

export default api