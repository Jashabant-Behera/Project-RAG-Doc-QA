const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];
const MAX_SIZE_MB = 50;

export const isValidFile = (file) => {
    if (!file) return { valid: false, error: "No file selected." };

    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Unsupported file type: .${ext}. Allowed: PDF, DOCX, TXT.`,
        };
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
        };
    }

    return { valid: true, error: null };
};

export const isValidQuestion = (question) => {
    if (!question || question.trim().length === 0) {
        return { valid: false, error: "Question cannot be empty." };
    }
    if (question.trim().length < 3) {
        return { valid: false, error: "Question is too short." };
    }
    return { valid: true, error: null };
};
