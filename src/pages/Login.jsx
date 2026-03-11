import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Login() {
    const handleLogin = (e) => {
        e.preventDefault();
        // Add proper authentication later
        window.location.href = '/'; 
    };

    return (
        <div className="container">
            <div className="login-container">
                <div className="login-card card">
                    <div className="login-header">
                        <i className="fas fa-user-circle"></i>
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your health dashboard</p>
                    </div>

                    <input type="email" className="input" placeholder="Email address" />
                    <input type="password" className="input" placeholder="Password" />
                    
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }} 
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>

                    <div className="divider">or</div>

                    <div className="social-login">
                        <button className="social-btn">
                            <i className="fab fa-google"></i> Google
                        </button>
                        <button className="social-btn">
                            <i className="fab fa-apple"></i> Apple
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Don't have an account? <a href="/signup" style={{ color: 'var(--primary)' }}>Sign up</a>
                    </p>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}