import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpenText } from "lucide-react";

const Header = () => {
    const location = useLocation();
    const [theme, setTheme] = useState("sunny");

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <header className="header">
            <div className="header-brand">
                <div className="header-logo"><BookOpenText className="lucide-icon animate-pulse" size={20} strokeWidth={2.5} /></div>
                <span className="header-title">RAG Doc Q&A</span>
            </div>
            <nav className="header-nav">
                <Link
                    to="/"
                    className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                >
                    Upload
                </Link>
                <Link
                    to="/chat"
                    className={`nav-link ${location.pathname === "/chat" ? "active" : ""}`}
                >
                    Chat
                </Link>

                <div className="theme-switcher">
                    <div className={`theme-dot ${theme === "sunny" ? "active" : ""}`} data-t="sunny" onClick={() => setTheme("sunny")} title="Sunny Yellow"></div>
                    <div className={`theme-dot ${theme === "coral" ? "active" : ""}`} data-t="coral" onClick={() => setTheme("coral")} title="Coral Reef"></div>
                    <div className={`theme-dot ${theme === "sage" ? "active" : ""}`} data-t="sage" onClick={() => setTheme("sage")} title="Sage Garden"></div>
                    <div className={`theme-dot ${theme === "lavender" ? "active" : ""}`} data-t="lavender" onClick={() => setTheme("lavender")} title="Lavender Dream"></div>
                    <div className={`theme-dot ${theme === "ocean" ? "active" : ""}`} data-t="ocean" onClick={() => setTheme("ocean")} title="Ocean Dusk"></div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
