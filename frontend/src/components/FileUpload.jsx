import { useRef, useState } from "react";
import { CloudUpload, FileText, CheckCircle2, AlertCircle, Upload, Loader } from "lucide-react";

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

    // Derived loading states for the UI
    const isUploading = status === "uploading";
    const isProcessing = status === "processing";
    const isBusy = isUploading || isProcessing || status === "coldstart";

    return (
        <>
            <div
                className={`dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isBusy && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{ display: "none" }}
                    onChange={handleInputChange}
                />
                <span className="dropzone-icon">
                    {file
                        ? <FileText className="lucide-icon animate-pulse" size={48} strokeWidth={1.5} />
                        : <CloudUpload className="lucide-icon animate-bounce" size={48} strokeWidth={1.5} />
                    }
                </span>
                <p className="dropzone-text">
                    {file ? file.name : "Drag & drop here, or click to browse"}
                </p>
                <p className="dropzone-hint">PDF · DOCX · TXT &nbsp;·&nbsp; Max 50MB</p>
            </div>

            {error && (
                <div className="status-msg error">
                    <AlertCircle className="lucide-icon" size={16} style={{ marginRight: 4 }} />
                    {error}
                </div>
            )}

            {status === "success" && (
                <div className="status-msg success">
                    <CheckCircle2 className="lucide-icon" size={16} style={{ marginRight: 4 }} />
                    Document uploaded and indexed successfully!
                </div>
            )}

            {file && !isBusy && (
                <div className="upload-actions">
                    <button className="btn btn-primary" onClick={handleUploadClick}>
                        <Upload size={16} /> Upload Document
                    </button>
                    <button className="btn btn-ghost" onClick={reset}>
                        Clear
                    </button>
                </div>
            )}

            {/* Loading states feedback */}
            {isUploading && (
                <div className="upload-actions">
                    <div className="btn-loading">
                        <div className="spinner"></div>
                        Uploading file…
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="upload-actions">
                    <div className="btn-loading">
                        <div className="spinner"></div>
                        Indexing document — this takes a few seconds…
                    </div>
                </div>
            )}

            {status === "coldstart" && (
                <div className="upload-actions">
                    <div className="btn-loading">
                        <div className="spinner"></div>
                        Server is warming up — models are loading (~30s on first deploy)…
                    </div>
                </div>
            )}
        </>
    );
};

export default FileUpload;
