import client from "./client";

export const askQuestion = async (question, docId) => {
    const response = await client.post("/ask", {
        question,
        doc_id: docId,
    });

    return response.data;
    // Returns: { answer, sources: [{ doc_id, filename, chunk_index, score, text }] }
};
