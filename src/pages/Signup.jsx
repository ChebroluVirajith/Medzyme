import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Signup() {
    const [error, setError] = useState('');

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: decoded.sub, // Using Google's 'sub' subject field as the unique uid
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                given_name: decoded.given_name,
            }));

            // Redirect to home
            window.location.href = '/';
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    const handleError = () => {
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="container">
            <div className="signup-container">
                <div className="signup-card">
                    {/* Header */}
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

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <div style={{
                        margin: '32px 0',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={handleError}
                            useOneTap
                            shape="rectangular"
                            theme="outline"
                            size="large"
                            text="continue_with"
                            width="100%"
                        />
                    </div>

                    {/* Terms */}
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