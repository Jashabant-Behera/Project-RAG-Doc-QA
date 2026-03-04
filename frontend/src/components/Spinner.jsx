const Spinner = ({ size = 24, color = "#4f46e5" }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                border: `3px solid #e5e7eb`,
                borderTop: `3px solid ${color}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                display: "inline-block",
            }}
        />
    );
};

export default Spinner;
