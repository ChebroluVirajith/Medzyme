import React from 'react';

export default function Header() {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/" className="logo" style={{ 
                    textDecoration: 'none', 
                    fontSize: '1.8rem', 
                    fontWeight: 'bold', 
                    color: '#100c5f' 
                }}>
                    Medzyme
                </a>
                <div className="header-actions">
                    <a href="/profile" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.95rem' }}>
                        Profile
                    </a>
                </div>
            </div>
        </header>
    );
}