import React from 'react';

export default function Signup() {
    const handleGoogleLogin = () => {
        // Handle Google auth here
        window.location.href = '/';
    };

    return (
        <div className="container">
            <div className="signup-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4z" fill="rgba(255,255,255,0.3)"/>
                                <path d="M16 8a5 5 0 100 10A5 5 0 0016 8z" fill="white"/>
                                <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
                            Welcome to Medzyme
                        </h2>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                            Your AI-powered health companion
                        </p>
                    </div>

                    <div style={{ margin: '32px 0' }}>
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#374151',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102,126,234,0.15)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Google Icon */}
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.6' }}>
                        By continuing, you agree to our{' '}
                        <a href="#terms" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#privacy" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}