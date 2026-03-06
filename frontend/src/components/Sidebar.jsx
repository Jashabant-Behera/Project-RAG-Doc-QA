import { formatDate } from "../utils/format";
import { FolderOpen, FileText } from "lucide-react";

const Sidebar = ({ docs = [], selectedDocId, onSelectDoc }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-title">Documents</span>
                <span className="doc-count-badge">{docs.length}</span>
            </div>

            {docs.length === 0 ? (
                <div className="sidebar-empty">
                    <span className="sidebar-empty-icon"><FolderOpen className="lucide-icon animate-float" size={48} strokeWidth={1.5} /></span>
                    <p className="sidebar-empty-text">
                        No documents yet.<br />
                        Upload one to get started.
                    </p>
                </div>
            ) : (
                <ul className="doc-list">
                    {docs.map((doc) => (
                        <li
                            key={doc.doc_id}
                            onClick={() => onSelectDoc(doc)}
                            className={`doc-item ${selectedDocId === doc.doc_id ? "selected" : ""}`}
                        >
                            <span className="doc-icon"><FileText size={20} className="lucide-icon" strokeWidth={2} /></span>
                            <div className="doc-info">
                                <div className="doc-name">{doc.filename}</div>
                                <div className="doc-meta">
                                    {doc.chunk_count} chunks · {formatDate(doc.uploadedAt)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default Sidebar;
