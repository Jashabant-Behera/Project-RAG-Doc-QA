import { useState } from "react";
import { uploadDocument } from "../api/upload";
import { isValidFile } from "../utils/validate";

const useUpload = () => {
    const [file, setFile] = useState(null);
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

        setStatus("uploading");
        setError(null);

        try {
            const resultPromise = uploadDocument(file);

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
