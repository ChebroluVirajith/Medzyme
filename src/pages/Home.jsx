import React, { useEffect, useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

// A small reusable component for your animated numbers
const StatCard = ({ endValue, label, suffix = "" }) => {
    // For simplicity in the React conversion, we are rendering the final value.
    // To add the scroll-based count-up animation, you would use an IntersectionObserver Hook here.
    return (
        <div className="stat-card card visible animated">
            <div className="number">{endValue}{suffix}</div>
            <div className="label">{label}</div>
        </div>
    );
};

export default function Home() {
    const [showToast, setShowToast] = useState(false);

    // This useEffect replaces your setTimeout logic for the notification
    useEffect(() => {
        const timer1 = setTimeout(() => setShowToast(true), 1500);
        const timer2 = setTimeout(() => setShowToast(false), 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <>
            <Header />
            <main className="container">
                <div className="hero">
                    <h1>AI-Powered Healthcare at Your Fingertips</h1>
                    <p>Get instant medical assistance, track your health, and connect with healthcare professionals</p>
                    <a href="/signup" className="btn btn-primary">Get Started</a>
                </div>

                <div className="stats">
                    <StatCard endValue="10000" label="Active Users" />
                    <StatCard endValue="98" suffix="%" label="Satisfaction Rate" />
                    <StatCard endValue="24/7" label="Support" />
                    <StatCard endValue="5000" label="AI Diagnoses" />
                </div>

                <div className="grid">
                    <a href="/diagnosis" className="feature-card card">
                        <i className="fas fa-stethoscope"></i>
                        <h3>AI Diagnosis</h3>
                        <p>Get instant AI-powered preliminary diagnosis based on your symptoms</p>
                    </a>
                    <a href="/telemedicine" className="feature-card card">
                        <i className="fas fa-video"></i>
                        <h3>Virtual Consultations</h3>
                        <p>Connect with healthcare professionals through secure video calls</p>
                    </a>
                    {/* ... other feature cards ... */}
                </div>
            </main>
            
            <BottomNav />

            {/* Toast Notification */}
            <div className={`toast ${showToast ? 'show' : ''}`} id="notification">
                Welcome to Medzyme! 🌟
            </div>
        </>
    );
}