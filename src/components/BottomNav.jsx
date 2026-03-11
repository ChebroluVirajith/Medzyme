import React, { useState, useEffect } from 'react';
import '../styles/BottomNav.css';

// SVG Icon Components with animations
const HomeIcon = () => (
    <svg className="nav-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 50 L50 20 L80 50 L80 85 Q80 90 75 90 L25 90 Q20 90 20 85 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="40" y="55" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

const DiagnosisIcon = () => (
    <svg className="nav-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 40 Q30 25 45 25 Q60 25 60 40 L60 75 Q60 85 50 85 L40 85 Q30 85 30 75 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="35" y1="50" x2="55" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="45" y1="40" x2="45" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

const ConsultIcon = () => (
    <svg className="nav-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="25" width="55" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="42.5" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <polygon points="85,45 85,55 70,50" fill="currentColor"/>
    </svg>
);

const MedicineIcon = () => (
    <svg className="nav-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 20 L35 15 Q35 10 40 10 L60 10 Q65 10 65 15 L65 20" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="35" y="20" width="30" height="60" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="50" cy="50" r="4" fill="currentColor"/>
        <circle cx="50" cy="35" r="3" fill="currentColor"/>
        <circle cx="50" cy="65" r="3" fill="currentColor"/>
    </svg>
);

const ProfileIcon = () => (
    <svg className="nav-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M25 60 Q25 50 50 50 Q75 50 75 60 L75 80 Q75 85 70 85 L30 85 Q25 85 25 80 Z" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Navigation Item Component
const NavItem = ({ href, label, icon: Icon, isActive, onClick }) => {
    return (
        <a 
            href={href} 
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="nav-icon-wrapper">
                <Icon />
                <div className="nav-ripple"></div>
            </div>
            <span className="nav-label">{label}</span>
        </a>
    );
};

export default function BottomNav() {
    const [activeLink, setActiveLink] = useState('/');

    useEffect(() => {
        // Set active link based on current path
        setActiveLink(window.location.pathname || '/');
    }, []);

    const handleNavClick = (href) => {
        setActiveLink(href);
    };

    return (
        <nav className="nav-bar">
            <div className="nav-container">
                {/* Background decoration */}
                <div className="nav-decoration"></div>

                {/* Navigation items */}
                <NavItem
                    href="/"
                    label="Home"
                    icon={HomeIcon}
                    isActive={activeLink === '/'}
                    onClick={() => handleNavClick('/')}
                />
                <NavItem
                    href="/diagnosis"
                    label="Diagnosis"
                    icon={DiagnosisIcon}
                    isActive={activeLink === '/diagnosis'}
                    onClick={() => handleNavClick('/diagnosis')}
                />
                <NavItem
                    href="/telemedicine"
                    label="Consult"
                    icon={ConsultIcon}
                    isActive={activeLink === '/telemedicine'}
                    onClick={() => handleNavClick('/telemedicine')}
                />
                <NavItem
                    href="/medicine_tracker"
                    label="Medicine"
                    icon={MedicineIcon}
                    isActive={activeLink === '/medicine_tracker'}
                    onClick={() => handleNavClick('/medicine_tracker')}
                />
                <NavItem
                    href="/profile"
                    label="Profile"
                    icon={ProfileIcon}
                    isActive={activeLink === '/profile'}
                    onClick={() => handleNavClick('/profile')}
                />

                {/* Active indicator */}
                <div className="nav-indicator"></div>
            </div>
        </nav>
    );
}