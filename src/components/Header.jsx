import React from 'react';

export default function Header() {
  return (
    <header className="header">
        <h1 className="logo">Medzyme</h1>
        <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <div className="auth-buttons">
                <a href="/login" className="btn btn-outline">Log In</a>
                <a href="/signup" className="btn btn-primary">Sign Up</a>
            </div>
        </nav>
    </header>
  );
}