import React from 'react';
import BottomNav from '../components/BottomNav';

export default function Profile() {
    return (
        <>
            <header className="header">
                <a href="/" className="logo">Medzyme</a>
            </header>

            <main className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <i className="fas fa-user"></i>
                    </div>
                    <h1>Sherlock Holmes</h1>
                    <p>Member since December 1881</p>
                    <span className="badge badge-success">Consulting Detective</span>
                </div>

                <div className="grid">
                    <div className="card">
                        <div className="stat-box">
                            <i className="fas fa-heartbeat"></i>
                            <div className="stat-info">
                                <h4>Heart Rate</h4>
                                <p>65 BPM</p>
                            </div>
                        </div>
                    </div>
                    {/* Add other stat boxes (Steps, Sleep, etc) here following the same pattern */}
                </div>

                <div className="profile-section card">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">consulting.detective@baker.st</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">+44 221 221 2218</span>
                    </div>
                </div>
            </main>
            <BottomNav />
        </>
    );
}