import { useState, useEffect, useCallback } from "react";
import { askQuestion } from "../api/qa";
import { isValidQuestion } from "../utils/validate";
import { formatTimestamp } from "../utils/format";

const CHAT_STORAGE_PREFIX = "rag_chat_";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

const storageKey = (docId) => `${CHAT_STORAGE_PREFIX}${docId}`;

const loadSession = (docId) => {
    if (!docId) return null;
    try {
        const raw = sessionStorage.getItem(storageKey(docId));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveSession = (docId, messages) => {
    if (!docId) return;
    try {
        sessionStorage.setItem(
            storageKey(docId),
            JSON.stringify({ messages, lastActiveAt: Date.now() })
        );
    } catch {
        // Silently catch quota exceeded errors
    }
};

const clearSession = (docId) => {
    if (!docId) return;
    sessionStorage.removeItem(storageKey(docId));
};

/**
 * Evaluates the idle state of the current document session and clears it
 * if the timeout threshold has been exceeded.
 */
export const expireSessionIfIdle = (docId) => {
    const session = loadSession(docId);
    if (!session) return;
    if (Date.now() - session.lastActiveAt >= IDLE_TIMEOUT_MS) {
        clearSession(docId);
    }
};

const useChat = () => {
    const [activeDocId, setActiveDocId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Initializes the chat state for a given document from session storage.
     */
    const loadDoc = useCallback((docId) => {
        if (!docId) {
            setActiveDocId(null);
            setMessages([]);
            return;
        }
        const session = loadSession(docId);
        setActiveDocId(docId);
        setMessages(session?.messages ?? []);
        setError(null);
    }, []);

    useEffect(() => {
        if (activeDocId) {
            saveSession(activeDocId, messages);
        }
    }, [activeDocId, messages]);

    const sendMessage = async (question, docId) => {
        const { valid, error: validationError } = isValidQuestion(question);
        if (!valid) { setError(validationError); return; }
        if (!docId) { setError("Please select a document first."); return; }

        if (docId !== activeDocId) loadDoc(docId);

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
        if (activeDocId) clearSession(activeDocId);
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        loadDoc,        // exposed so App.jsx can call it on doc switch
    };
};

export default useChat;
