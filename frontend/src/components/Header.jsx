import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-logo-left">
                    <img src="/images/bg11.jpeg" alt="MITS Logo" className="header-logo-img" />
                </div>
                <div className="header-center">
                    <img src="/images/image1.png" alt="MITS" className="header-center-img" />
                    <p className="header-portal-title">Examination Results Portal</p>
                </div>
                <nav className="header-nav">
                    <button
                        className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        Home
                    </button>
                    <button
                        className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''}`}
                        onClick={() => navigate('/contact')}
                    >
                        Contact
                    </button>
                </nav>
            </div>
        </header>
    );
}

export default Header;
