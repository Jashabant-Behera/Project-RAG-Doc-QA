const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = {
    post: async (url, data, config = {}) => {
        let headers = config.headers || { "Content-Type": "application/json" };
        let body;

        if (data instanceof FormData) {
            delete headers["Content-Type"];
            body = data;
        } else {
            body = JSON.stringify(data);
        }

        const response = await fetch(`${baseURL}${url}`, {
            method: "POST",
            headers,
            body
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            // Mock Axios error format for existing hook error handling
            // eslint-disable-next-line no-throw-literal
            throw { response: { data: errData, status: response.status } };
        }

        return { data: await response.json() };
    }
};

export default client;
