import { useRef, useState } from "react";

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
        <>
            <div
                className={`dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
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
                <span className="dropzone-icon">{file ? "DOC" : "FILE"}</span>
                <p className="dropzone-text">
                    {file ? file.name : "Drag & drop here, or click to browse"}
                </p>
                <p className="dropzone-hint">PDF · DOCX · TXT &nbsp;·&nbsp; Max 50MB</p>
            </div>

            {error && <div className="status-msg error">Error: {error}</div>}

            {status === "success" && (
                <div className="status-msg success">
                    Success: Document uploaded and indexed successfully!
                </div>
            )}

            {file && status !== "uploading" && (
                <div className="upload-actions">
                    <button className="btn btn-primary" onClick={handleUploadClick}>
                        Upload Document
                    </button>
                    <button className="btn btn-ghost" onClick={reset}>
                        Clear
                    </button>
                </div>
            )}

            {status === "uploading" && (
                <div className="upload-actions">
                    <div className="btn-loading">
                        <div className="spinner"></div>
                        Uploading and indexing...
                    </div>
                </div>
            )}
        </>
    );
};

export default FileUpload;
