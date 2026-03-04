import client from "./client";

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
    // Returns: { doc_id, filename, chunk_count }
};
