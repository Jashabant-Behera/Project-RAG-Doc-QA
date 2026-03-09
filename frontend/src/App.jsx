import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import useUpload from "./hooks/useUpload";
import useChat, { expireSessionIfIdle } from "./hooks/useChat";

const App = () => {
    const uploadHook = useUpload();
    const chatHook = useChat();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleUploadSuccess = (doc) => {
        if (selectedDoc?.doc_id) {
            expireSessionIfIdle(selectedDoc.doc_id);
        }
        setSelectedDoc(doc);
        chatHook.loadDoc(doc.doc_id);
    };

    const handleSelectDoc = (doc) => {
        if (selectedDoc?.doc_id && selectedDoc.doc_id !== doc.doc_id) {
            expireSessionIfIdle(selectedDoc.doc_id);
        }
        setSelectedDoc(doc);
        chatHook.loadDoc(doc.doc_id);
    };

    return (
        <BrowserRouter>
            <div className="app-shell">
                <Header />
                <div className="body-row">
                    <Sidebar
                        docs={uploadHook.uploadedDocs}
                        selectedDocId={selectedDoc?.doc_id}
                        onSelectDoc={handleSelectDoc}
                    />
                    <div className="main-content">
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

export default App;
