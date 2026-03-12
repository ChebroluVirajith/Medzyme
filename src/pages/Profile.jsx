import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load the user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data", error);
            }
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem('user');
            window.location.href = '/signup';
        }
    };

    if (!user) {
        return (
            <>
                <header className="header">
                    <div className="container"><h1>Profile</h1></div>
                </header>
                <div className="container">
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
                        <h2 style={{ marginBottom: '12px' }}>Welcome back!</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                            Please sign in to view your profile and health data.
                        </p>
                        <a href="/signup" className="btn btn-primary">Sign In with Google</a>
                    </div>
                </div>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <header className="header">
                <a href="/" className="logo">Medzyme</a>
            </header>

            <main className="container" style={{ paddingTop: '20px' }}>
                <div className="profile-header card" style={{ textAlign: 'center', padding: '30px' }}>
                    {user.picture ? (
                        <img 
                            src={user.picture} 
                            alt={user.name} 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="profile-avatar" style={{ margin: '0 auto 16px' }}>
                            <i className="fas fa-user"></i>
                        </div>
                    )}
                    
                    <h1 style={{ marginBottom: '4px' }}>{user.name}</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>Medzyme Member</p>
                    <span className="badge badge-success" style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>Verified Use</span>
                </div>

                <div className="profile-section card" style={{ marginTop: '20px' }}>
                    <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>Account Information</h3>
                    
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span className="detail-label" style={{ fontWeight: '600', color: '#4b5563' }}>Full Name</span>
                        <span className="detail-value" style={{ color: '#111827' }}>{user.name}</span>
                    </div>
                    
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span className="detail-label" style={{ fontWeight: '600', color: '#4b5563' }}>Email</span>
                        <span className="detail-value" style={{ color: '#111827' }}>{user.email || 'Not provided'}</span>
                    </div>

                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                        <span className="detail-label" style={{ fontWeight: '600', color: '#4b5563' }}>User ID</span>
                        <span className="detail-value" style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{user.uid?.substring(0, 10)}...</span>
                    </div>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button 
                        onClick={handleLogout} 
                        className="btn" 
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '12px 24px', width: '100%' }}
                    >
                        Sign Out
                    </button>
                </div>
            </main>
            <BottomNav />
        </>
    );
}