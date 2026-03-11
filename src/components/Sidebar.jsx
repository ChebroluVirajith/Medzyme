import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';

// SVG Icon Components (same as before)
const HomeIcon = () => (
    <svg className="sidebar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 50 L50 20 L80 50 L80 85 Q80 90 75 90 L25 90 Q20 90 20 85 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="40" y="55" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

const DiagnosisIcon = () => (
    <svg className="sidebar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 40 Q30 25 45 25 Q60 25 60 40 L60 75 Q60 85 50 85 L40 85 Q30 85 30 75 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="35" y1="50" x2="55" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="45" y1="40" x2="45" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

const ConsultIcon = () => (
    <svg className="sidebar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="25" width="55" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="42.5" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <polygon points="85,45 85,55 70,50" fill="currentColor"/>
    </svg>
);

const MedicineIcon = () => (
    <svg className="sidebar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 20 L35 15 Q35 10 40 10 L60 10 Q65 10 65 15 L65 20" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="35" y="20" width="30" height="60" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="50" cy="50" r="4" fill="currentColor"/>
        <circle cx="50" cy="35" r="3" fill="currentColor"/>
        <circle cx="50" cy="65" r="3" fill="currentColor"/>
    </svg>
);

const ProfileIcon = () => (
    <svg className="sidebar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M25 60 Q25 50 50 50 Q75 50 75 60 L75 80 Q75 85 70 85 L30 85 Q25 85 25 80 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Sidebar Menu Item Component
const SidebarItem = ({ href, label, icon: Icon, isActive, onClick }) => {
    return (
        <a 
            href={href} 
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="sidebar-item-icon">
                <Icon />
            </div>
            <span className="sidebar-item-label">{label}</span>
            <div className="sidebar-item-indicator"></div>
        </a>
    );
};

export default function Sidebar({ isOpen, onClose }) {
    const [activeLink, setActiveLink] = useState('/');

    useEffect(() => {
        setActiveLink(window.location.pathname || '/');
    }, []);

    const handleItemClick = (href) => {
        setActiveLink(href);
        // Close sidebar on mobile after clicking
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay backdrop */}
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">Medzyme</h2>
                    <button 
                        className="sidebar-close-btn"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </div>

                {/* Divider */}
                <div className="sidebar-divider"></div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <p className="sidebar-section-title">Main Menu</p>
                        <SidebarItem
                            href="/"
                            label="Home"
                            icon={HomeIcon}
                            isActive={activeLink === '/'}
                            onClick={() => handleItemClick('/')}
                        />
                        <SidebarItem
                            href="/diagnosis"
                            label="AI Diagnosis"
                            icon={DiagnosisIcon}
                            isActive={activeLink === '/diagnosis'}
                            onClick={() => handleItemClick('/diagnosis')}
                        />
                        <SidebarItem
                            href="/telemedicine"
                            label="Virtual Consult"
                            icon={ConsultIcon}
                            isActive={activeLink === '/telemedicine'}
                            onClick={() => handleItemClick('/telemedicine')}
                        />
                        <SidebarItem
                            href="/medicine_tracker"
                            label="Medicine Tracker"
                            icon={MedicineIcon}
                            isActive={activeLink === '/medicine_tracker'}
                            onClick={() => handleItemClick('/medicine_tracker')}
                        />
                        <SidebarItem
                            href="/profile"
                            label="My Profile"
                            icon={ProfileIcon}
                            isActive={activeLink === '/profile'}
                            onClick={() => handleItemClick('/profile')}
                        />
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-info">
                        <div className="user-avatar">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="35" r="18" fill="none" stroke="currentColor" strokeWidth="2"/>
                                <path d="M25 75 Q25 60 50 60 Q75 60 75 75 L75 85 Q75 90 70 90 L30 90 Q25 90 25 85 Z" 
                                      fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="user-details">
                            <p className="user-name">Guest User</p>
                            <p className="user-status">Not logged in</p>
                        </div>
                    </div>
                    <div className="sidebar-auth-buttons">
                        <a href="/login" className="btn btn-outline">Log In</a>
                        <a href="/signup" className="btn btn-primary">Sign Up</a>
                    </div>
                </div>
            </aside>
        </>
    );
}