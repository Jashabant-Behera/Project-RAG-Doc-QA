import { Link, useLocation } from "react-router-dom";

const Header = () => {
    const location = useLocation();

    return (
        <header style={styles.header}>
            <div style={styles.brand}>
                <span style={styles.logo}>📄</span>
                <span style={styles.title}>RAG Doc Q&A</span>
            </div>
            <nav style={styles.nav}>
                <Link
                    to="/"
                    style={{
                        ...styles.link,
                        ...(location.pathname === "/" ? styles.activeLink : {}),
                    }}
                >
                    Upload
                </Link>
                <Link
                    to="/chat"
                    style={{
                        ...styles.link,
                        ...(location.pathname === "/chat" ? styles.activeLink : {}),
                    }}
                >
                    Chat
                </Link>
            </nav>
        </header>
    );
};

const styles = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "60px",
        backgroundColor: "#1e3a5f",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
    },
    brand: { display: "flex", alignItems: "center", gap: "10px" },
    logo: { fontSize: "22px" },
    title: { fontSize: "18px", fontWeight: "700", color: "#fff" },
    nav: { display: "flex", gap: "24px" },
    link: {
        color: "#cbd5e1",
        textDecoration: "none",
        fontSize: "15px",
        fontWeight: "500",
    },
    activeLink: {
        color: "#ffffff",
        borderBottom: "2px solid #60a5fa",
        paddingBottom: "2px",
    },
};

export default Header;
