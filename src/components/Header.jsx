import React, { useState, useEffect, useRef } from 'react';
import '../styles/Header.css';

export default function Header({ onMenuClick }) {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <header className="header">
            {/* Hamburger */}
            <button
                className="header-menu-btn"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* Logo */}
            <h1 className="logo">Medzyme</h1>

            {/* Nav */}
            <nav className="header-nav">
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>

                <div className="auth-buttons">
                    {user ? (
                        /* Profile Avatar + Dropdown */
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <img
                                src={user.picture}
                                alt={user.name}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    border: '2px solid #667eea',
                                    objectFit: 'cover',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.3)'}
                                onMouseLeave={e => e.target.style.boxShadow = 'none'}
                            />

                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '48px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    padding: '8px',
                                    minWidth: '200px',
                                    zIndex: 200,
                                    border: '1px solid #e5e7eb',
                                }}>
                                    {/* User Info */}
                                    <div style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f3f4f6',
                                        marginBottom: '8px',
                                    }}>
                                        <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                                            {user.given_name}
                                        </p>
                                        <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: '0.8rem' }}>
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    {[
                                        { label: '👤  My Profile', href: '/profile' },
                                        { label: '💊  Medicine Tracker', href: '/medicine_tracker' },
                                        { label: '⚙️  Settings', href: '/settings' },
                                    ].map(item => (
                                        <a key={item.href} href={item.href} style={{
                                            display: 'block',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            color: '#374151',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {item.label}
                                        </a>
                                    ))}

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'none',
                                            color: '#ef4444',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            marginTop: '4px',
                                            borderTop: '1px solid #f3f4f6',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        🚪  Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/signup" className="btn btn-primary">Sign Up / Login</a>
                    )}
                </div>
            </nav>
        </header>
    );
}