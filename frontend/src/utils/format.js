export const formatTimestamp = (date = new Date()) => {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDate = (date = new Date()) => {
    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const truncateText = (text, maxLen = 150) => {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
};
