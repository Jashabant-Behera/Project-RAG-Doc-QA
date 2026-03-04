import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import useUpload from "./hooks/useUpload";
import useChat from "./hooks/useChat";

const App = () => {
    const uploadHook = useUpload();
    const chatHook = useChat();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleUploadSuccess = (doc) => {
        setSelectedDoc(doc);
    };

    const handleSelectDoc = (doc) => {
        setSelectedDoc(doc);
        chatHook.clearChat();
    };

    return (
        <BrowserRouter>
            <div style={styles.app}>
                <Header />
                <div style={styles.body}>
                    <Sidebar
                        docs={uploadHook.uploadedDocs}
                        selectedDocId={selectedDoc?.doc_id}
                        onSelectDoc={handleSelectDoc}
                    />
                    <div style={styles.content}>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <Home
                                        useUploadHook={uploadHook}
                                        onUploadSuccess={handleUploadSuccess}
                                    />
                                }
                            />
                            <Route
                                path="/chat"
                                element={
                                    <Chat
                                        useChatHook={chatHook}
                                        selectedDoc={selectedDoc}
                                    />
                                }
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
};

const styles = {
    app: { display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
    body: { display: "flex", flex: 1 },
    content: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
};

export default App;
