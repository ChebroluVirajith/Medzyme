import React from 'react';
import '../styles/Header.css';

export default function Header({ onMenuClick }) {
    return (
        <header className="header">
            {/* Hamburger Menu Button */}
            <button 
                className="header-menu-btn"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
                title="Open menu"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* Logo */}
            <h1 className="logo">Medzyme</h1>

            {/* Desktop Navigation */}
            <nav className="header-nav">
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <div className="auth-buttons">
                    <a href="/signup" className="btn btn-primary">Sign Up / Login</a>
                </div>
            </nav>
        </header>
    );
}