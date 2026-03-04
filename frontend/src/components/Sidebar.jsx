import { formatDate } from "../utils/format";

const Sidebar = ({ docs = [], selectedDocId, onSelectDoc }) => {
    return (
        <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
                <span style={styles.sidebarTitle}>Documents</span>
                <span style={styles.count}>{docs.length}</span>
            </div>

            {docs.length === 0 ? (
                <div style={styles.empty}>
                    No documents yet.<br />
                    Upload one to get started.
                </div>
            ) : (
                <ul style={styles.list}>
                    {docs.map((doc) => (
                        <li
                            key={doc.doc_id}
                            onClick={() => onSelectDoc(doc)}
                            style={{
                                ...styles.item,
                                ...(selectedDocId === doc.doc_id ? styles.selectedItem : {}),
                            }}
                        >
                            <span style={styles.fileIcon}>📄</span>
                            <div style={styles.docInfo}>
                                <span style={styles.filename}>{doc.filename}</span>
                                <span style={styles.meta}>
                                    {doc.chunk_count} chunks · {formatDate(doc.uploadedAt)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

const styles = {
    sidebar: {
        width: "260px",
        minHeight: "calc(100vh - 60px)",
        backgroundColor: "#f8fafc",
        borderRight: "1px solid #e2e8f0",
        padding: "16px 0",
        flexShrink: 0,
    },
    sidebarHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px 12px",
        borderBottom: "1px solid #e2e8f0",
    },
    sidebarTitle: { fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    count: { fontSize: "12px", backgroundColor: "#e2e8f0", color: "#475569", borderRadius: "10px", padding: "1px 8px" },
    empty: { padding: "24px 16px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" },
    list: { listStyle: "none", margin: 0, padding: "8px 0" },
    item: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px 16px",
        cursor: "pointer",
        borderLeft: "3px solid transparent",
        transition: "all 0.15s",
    },
    selectedItem: {
        backgroundColor: "#eff6ff",
        borderLeft: "3px solid #3b82f6",
    },
    fileIcon: { fontSize: "18px", marginTop: "2px" },
    docInfo: { display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" },
    filename: { fontSize: "13px", fontWeight: "500", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    meta: { fontSize: "11px", color: "#94a3b8" },
};

export default Sidebar;
