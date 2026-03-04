import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";

const Home = ({ useUploadHook, onUploadSuccess }) => {
    const navigate = useNavigate();

    return (
        <main style={styles.main}>
            <div style={styles.card}>
                <h1 style={styles.heading}>Upload a Document</h1>
                <p style={styles.subheading}>
                    Upload a PDF, DOCX, or TXT file. Once indexed, you can ask
                    questions about it in the Chat page.
                </p>
                <FileUpload
                    useUploadHook={useUploadHook}
                    onUploadSuccess={(doc) => {
                        onUploadSuccess(doc);
                        setTimeout(() => navigate("/chat"), 1500);
                    }}
                />
            </div>
        </main>
    );
};

const styles = {
    main: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", backgroundColor: "#f8fafc" },
    card: { backgroundColor: "#fff", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", width: "100%", maxWidth: "600px" },
    heading: { margin: "0 0 8px", fontSize: "24px", fontWeight: "700", color: "#1e293b" },
    subheading: { margin: "0 0 28px", fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

export default Home;
