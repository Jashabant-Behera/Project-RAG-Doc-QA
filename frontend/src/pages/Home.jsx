import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";

const Home = ({ useUploadHook, onUploadSuccess }) => {
    const navigate = useNavigate();

    return (
        <div className="page active">
            <div className="upload-page">
                <div className="upload-card">
                    <div className="retro-dots" style={{ top: "-20px", right: "-20px", opacity: 0.4 }}></div>
                    <span className="card-label">Step 01</span>
                    <div className="accent-bar"></div>
                    <h1 className="card-heading">Upload Your Document</h1>
                    <p className="card-subtext">
                        Drop in a PDF, DOCX, or TXT file. We'll chunk, embed, and index it — then you can ask anything about it.
                    </p>
                    <FileUpload
                        useUploadHook={useUploadHook}
                        onUploadSuccess={(doc) => {
                            onUploadSuccess(doc);
                            setTimeout(() => navigate("/chat"), 1500);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
