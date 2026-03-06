import { useState } from "react";
import { uploadDocument } from "../api/upload";
import { isValidFile } from "../utils/validate";

const useUpload = () => {
    const [file, setFile] = useState(null);
    // ✅ FIX: status can now be "idle" | "uploading" | "processing" | "success" | "error"
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const handleFileSelect = (selectedFile) => {
        const { valid, error: validationError } = isValidFile(selectedFile);
        if (!valid) {
            setError(validationError);
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setStatus("idle");
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return null;
        }

        // Phase 1: sending the file bytes
        setStatus("uploading");
        setError(null);

        try {
            // uploadDocument now:
            //   1. POSTs the file → server returns {doc_id, status:"processing"} instantly
            //   2. Polls /upload/status/:doc_id until "ready"
            // We surface the transition to "processing" inside the polling loop
            // by having uploadDocument resolve only when indexing is complete.

            // ✅ FIX: Switch to "processing" after the file lands on the server.
            // The upload API does the polling internally; we just need a way to
            // reflect the intermediate state. We do this by wrapping it:
            const resultPromise = uploadDocument(file);

            // Give the file ~800ms to reach the server, then flip to "processing"
            const processingTimer = setTimeout(() => setStatus("processing"), 800);

            const result = await resultPromise;
            clearTimeout(processingTimer);

            const newDoc = {
                ...result,
                uploadedAt: new Date(),
            };

            setUploadedDocs((prev) => [...prev, newDoc]);
            setStatus("success");
            setFile(null);
            return newDoc;

        } catch (err) {
            const message =
                err.response?.data?.detail || "Upload failed. Please try again.";
            setError(message);
            setStatus("error");
            return null;
        }
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setError(null);
    };

    return {
        file,
        status,
        error,
        uploadedDocs,
        handleFileSelect,
        handleUpload,
        reset,
    };
};

export default useUpload;
