import React from 'react';

export default function BottomNav() {
  return (
    <nav className="nav-bar">
        <a href="/" className="active"><i className="fas fa-home"></i>Home</a>
        <a href="/diagnosis"><i className="fas fa-stethoscope"></i>Diagnosis</a>
        <a href="/telemedicine"><i className="fas fa-video"></i>Consult</a>
        <a href="/medicine_tracker"><i className="fas fa-pills"></i>Medicine</a>
        <a href="/profile"><i className="fas fa-user"></i>Profile</a>
    </nav>
  );
}