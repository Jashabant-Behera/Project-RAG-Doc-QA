import { useState } from "react";
import { askQuestion } from "../api/qa";
import { isValidQuestion } from "../utils/validate";
import { formatTimestamp } from "../utils/format";

const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (question, docId) => {
        const { valid, error: validationError } = isValidQuestion(question);
        if (!valid) {
            setError(validationError);
            return;
        }

        if (!docId) {
            setError("Please select a document from the sidebar before asking.");
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            text: question,
            timestamp: formatTimestamp(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const result = await askQuestion(question, docId);

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                text: result.answer,
                sources: result.sources || [],
                timestamp: formatTimestamp(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            const message =
                err.response?.data?.detail || "Something went wrong. Please try again.";
            setError(message);

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    text: `Error: ${message}`,
                    sources: [],
                    timestamp: formatTimestamp(),
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
    };
};

export default useChat;
