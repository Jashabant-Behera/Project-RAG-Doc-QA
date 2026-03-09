import client from "./client";

export const askQuestion = async (question, docId) => {
    const response = await client.post("/ask", {
        question,
        doc_id: docId,
    });

    return response.data;
};
