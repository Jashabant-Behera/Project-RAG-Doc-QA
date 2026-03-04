import { useState, useRef, useEffect } from "react";
import Spinner from "./Spinner";

const ChatView = ({ useChatHook, selectedDoc }) => {
    const { messages, isLoading, error, sendMessage, clearChat } = useChatHook;
    const [input, setInput] = useState("");
    const [expandedSources, setExpandedSources] = useState({});
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input.trim(), selectedDoc?.doc_id);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleSources = (id) => {
        setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={styles.container}>
            {selectedDoc ? (
                <div style={styles.docBanner}>
                    📄 Chatting about: <strong>{selectedDoc.filename}</strong>
                    <button onClick={clearChat} style={styles.clearBtn}>
                        Clear chat
                    </button>
                </div>
            ) : (
                <div style={styles.noDocBanner}>
                    ⚠️ No document selected. Go to Upload or select one from the sidebar.
                </div>
            )}

            <div style={styles.messages}>
                {messages.length === 0 && (
                    <div style={styles.emptyState}>
                        Ask a question about your document to get started.
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            ...styles.messageRow,
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <div
                            style={{
                                ...styles.bubble,
                                ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble),
                                ...(msg.isError ? styles.errorBubble : {}),
                            }}
                        >
                            <p style={styles.bubbleText}>{msg.text}</p>
                            <span style={styles.timestamp}>{msg.timestamp}</span>

                            {msg.role === "assistant" && msg.sources?.length > 0 && (
                                <div style={styles.sourcesSection}>
                                    <button
                                        onClick={() => toggleSources(msg.id)}
                                        style={styles.sourcesToggle}
                                    >
                                        {expandedSources[msg.id] ? "▲" : "▼"}{" "}
                                        {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                                    </button>

                                    {expandedSources[msg.id] && (
                                        <div style={styles.sourcesList}>
                                            {msg.sources.map((src, i) => (
                                                <div key={i} style={styles.sourceItem}>
                                                    <div style={styles.sourceMeta}>
                                                        <span style={styles.sourceFile}>📄 {src.filename}</span>
                                                        <span style={styles.sourceScore}>Score: {src.score}</span>
                                                    </div>
                                                    <p style={styles.sourceText}>{src.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                        <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
                            <Spinner size={18} color="#3b82f6" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div style={styles.inputBar}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        selectedDoc
                            ? "Ask a question about your document..."
                            : "Select a document first..."
                    }
                    disabled={!selectedDoc || isLoading}
                    rows={2}
                    style={styles.textarea}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || !selectedDoc || isLoading}
                    style={{
                        ...styles.sendBtn,
                        opacity: !input.trim() || !selectedDoc || isLoading ? 0.5 : 1,
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", flex: 1 },
    docBanner: { padding: "10px 20px", backgroundColor: "#eff6ff", borderBottom: "1px solid #bfdbfe", fontSize: "13px", color: "#1e40af", display: "flex", justifyContent: "space-between", alignItems: "center" },
    noDocBanner: { padding: "10px 20px", backgroundColor: "#fff7ed", borderBottom: "1px solid #fed7aa", fontSize: "13px", color: "#c2410c" },
    clearBtn: { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px" },
    messages: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
    emptyState: { textAlign: "center", color: "#94a3b8", fontSize: "14px", marginTop: "40px" },
    messageRow: { display: "flex" },
    bubble: { maxWidth: "70%", borderRadius: "12px", padding: "12px 16px" },
    userBubble: { backgroundColor: "#1e3a5f", color: "#fff", borderBottomRightRadius: "4px" },
    assistantBubble: { backgroundColor: "#f1f5f9", color: "#1e293b", borderBottomLeftRadius: "4px" },
    errorBubble: { backgroundColor: "#fef2f2", color: "#dc2626" },
    bubbleText: { margin: 0, fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" },
    timestamp: { fontSize: "11px", opacity: 0.6, marginTop: "6px", display: "block" },
    sourcesSection: { marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "8px" },
    sourcesToggle: { background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#3b82f6", padding: 0 },
    sourcesList: { marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" },
    sourceItem: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px" },
    sourceMeta: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
    sourceFile: { fontSize: "11px", color: "#64748b", fontWeight: "600" },
    sourceScore: { fontSize: "11px", color: "#94a3b8" },
    sourceText: { margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.5" },
    inputBar: { display: "flex", gap: "10px", padding: "16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#fff" },
    textarea: { flex: 1, resize: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", outline: "none" },
    sendBtn: { padding: "0 24px", backgroundColor: "#1e3a5f", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
};

export default ChatView;
