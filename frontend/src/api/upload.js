import client from "./client";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const { doc_id, filename } = response.data;

    const result = await pollUntilReady(doc_id);
    return { ...result, filename };
};

/**
 * Polls the upload status endpoint until asynchronous indexing completes.
 * @throws Will reject if polling times out.
 */
async function pollUntilReady(doc_id, intervalMs = 1500, timeoutMs = 180_000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        await sleep(intervalMs);

        const res = await fetch(`${baseURL}/upload/status/${doc_id}`);
        if (!res.ok) throw new Error("Failed to check indexing status.");

        const data = await res.json();

        if (data.status === "ready") return data;
        if (data.status === "error") {
            // eslint-disable-next-line no-throw-literal
            throw { response: { data: { detail: data.message || "Indexing failed." } } };
        }
        // status === "processing" → keep polling
    }

    // eslint-disable-next-line no-throw-literal
    throw { response: { data: { detail: "Indexing timed out. Please try again." } } };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
