import { useState, useRef, useEffect } from "react";
import { FileText, MessageSquare, AlertCircle, Send } from "lucide-react";

const ChatView = ({ useChatHook, selectedDoc }) => {
    const { messages, isLoading, error, sendMessage, clearChat } = useChatHook;
    const [input, setInput] = useState("");
    const [expandedSources, setExpandedSources] = useState({});
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!input.trim() || !selectedDoc || isLoading) return;
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
        <>
            {selectedDoc ? (
                <div className="doc-banner">
                    <span><FileText size={16} className="lucide-icon" style={{ marginRight: 6 }} /> Chatting about: <strong>{selectedDoc.filename}</strong></span>
                    <button onClick={clearChat} className="btn btn-ghost btn-sm">
                        Clear chat
                    </button>
                </div>
            ) : (
                <div className="no-doc-banner">
                    <AlertCircle className="lucide-icon animate-pulse" size={16} style={{ marginRight: 6 }} /> No document selected. Upload one or pick from the sidebar.
                </div>
            )}

            <div className="messages-area">
                {messages.length === 0 && (
                    <div className="empty-chat">
                        <span className="empty-chat-icon"><MessageSquare className="lucide-icon animate-float" size={48} strokeWidth={1.5} /></span>
                        <h2 className="empty-chat-title">Ask anything</h2>
                        <p className="empty-chat-sub">Your answers will come straight from the document.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`msg-row ${msg.role}`}>
                        <div className={`bubble ${msg.role} ${msg.isError ? "error-bubble" : ""}`}>
                            <p className="bubble-text">{msg.text}</p>
                            <span className="bubble-time">{msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                            {msg.role === "assistant" && msg.sources?.length > 0 && (
                                <div className="sources-section">
                                    <button
                                        onClick={() => toggleSources(msg.id)}
                                        className="sources-btn"
                                    >
                                        {expandedSources[msg.id] ? "▲" : "▼"}{" "}
                                        {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                                    </button>

                                    {expandedSources[msg.id] && (
                                        <div className="sources-list">
                                            {msg.sources.map((src, i) => (
                                                <div key={i} className="source-card">
                                                    <div className="source-meta">
                                                        <span className="source-filename"><FileText size={12} className="lucide-icon" style={{ marginRight: 4, marginTop: -2 }} /> {src.filename}</span>
                                                        <span className="source-score">Score: {src.score}</span>
                                                    </div>
                                                    <p className="source-text">{src.text}</p>
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
                    <div className="msg-row assistant">
                        <div className="bubble assistant">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <div className="input-bar">
                <textarea
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        selectedDoc
                            ? "Ask a question about your document..."
                            : "Select a document first..."
                    }
                    disabled={!selectedDoc || isLoading}
                    rows="2"
                ></textarea>
                <button
                    className="btn btn-primary"
                    onClick={handleSend}
                    disabled={!input.trim() || !selectedDoc || isLoading}
                >
                    Send <Send size={16} className="lucide-icon" style={{ marginLeft: 4 }} />
                </button>
            </div>
        </>
    );
};

export default ChatView;
