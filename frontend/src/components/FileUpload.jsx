import { useRef, useState } from "react";
import Spinner from "./Spinner";

const FileUpload = ({ onUploadSuccess, useUploadHook }) => {
    const {
        file,
        status,
        error,
        handleFileSelect,
        handleUpload,
        reset,
    } = useUploadHook;

    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileSelect(dropped);
    };

    const handleInputChange = (e) => {
        const selected = e.target.files[0];
        if (selected) handleFileSelect(selected);
    };

    const handleUploadClick = async () => {
        const result = await handleUpload();
        if (result && onUploadSuccess) {
            onUploadSuccess(result);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div
                style={{
                    ...styles.dropzone,
                    ...(isDragging ? styles.dropzoneDragging : {}),
                    ...(file ? styles.dropzoneReady : {}),
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{ display: "none" }}
                    onChange={handleInputChange}
                />
                <span style={styles.dropIcon}>{file ? "📄" : "☁️"}</span>
                <p style={styles.dropText}>
                    {file ? file.name : "Drag & drop a file here, or click to browse"}
                </p>
                <p style={styles.dropHint}>Supports PDF, DOCX, TXT · Max 50MB</p>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {status === "success" && (
                <p style={styles.success}>
                    ✅ Document uploaded and indexed successfully!
                </p>
            )}

            <div style={styles.actions}>
                {file && status !== "uploading" && (
                    <>
                        <button onClick={handleUploadClick} style={styles.uploadBtn}>
                            Upload Document
                        </button>
                        <button onClick={reset} style={styles.resetBtn}>
                            Clear
                        </button>
                    </>
                )}
                {status === "uploading" && (
                    <div style={styles.loadingRow}>
                        <Spinner size={20} />
                        <span style={styles.loadingText}>Uploading and indexing...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    wrapper: { width: "100%", maxWidth: "560px" },
    dropzone: {
        border: "2px dashed #cbd5e1",
        borderRadius: "12px",
        padding: "40px 24px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: "#f8fafc",
    },
    dropzoneDragging: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
    dropzoneReady: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
    dropIcon: { fontSize: "40px" },
    dropText: { margin: "12px 0 4px", fontSize: "15px", color: "#334155", fontWeight: "500" },
    dropHint: { margin: 0, fontSize: "12px", color: "#94a3b8" },
    error: { color: "#ef4444", fontSize: "13px", marginTop: "8px" },
    success: { color: "#16a34a", fontSize: "13px", marginTop: "8px" },
    actions: { marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" },
    uploadBtn: {
        padding: "10px 24px",
        backgroundColor: "#1e3a5f",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
    },
    resetBtn: {
        padding: "10px 16px",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
    },
    loadingRow: { display: "flex", alignItems: "center", gap: "10px" },
    loadingText: { fontSize: "14px", color: "#64748b" },
};

export default FileUpload;
