import React from 'react';

export default function Signup() {
    const handleSignup = (e) => {
        e.preventDefault();
        window.location.href = '/'; 
    };

    return (
        <div className="container">
            <div className="signup-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <i className="fas fa-user-plus"></i>
                        <h2>Create Your Account</h2>
                        <p>Join Medzyme for personalized healthcare assistance</p>
                    </div>

                    <div className="input-group">
                        <input type="text" className="input" placeholder="First Name" />
                        <input type="text" className="input" placeholder="Last Name" />
                    </div>

                    <input type="email" className="input" placeholder="Email address" />
                    <input type="password" className="input" placeholder="Create password" />
                    <input type="password" className="input" placeholder="Confirm password" />
                    <input type="date" className="input" placeholder="Date of birth" />
                    
                    <button className="btn btn-primary" onClick={handleSignup} style={{width: '100%'}}>
                        Create Account
                    </button>

                    <div className="divider">or</div>

                    <div className="social-login">
                        <button className="social-btn"><i className="fab fa-google"></i> Google</button>
                        <button className="social-btn"><i className="fab fa-apple"></i> Apple</button>
                    </div>

                    <div className="terms">
                        By signing up, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Already have an account? <a href="/login" style={{ color: 'var(--primary)' }}>Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}