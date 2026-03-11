import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Diagnosis from './pages/Diagnosis';
import Telemedicine from './pages/Telemedicine';
import MedicineTracker from './pages/MedicineTracker';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/telemedicine" element={<Telemedicine />} />
        <Route path="/medicine_tracker" element={<MedicineTracker />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}