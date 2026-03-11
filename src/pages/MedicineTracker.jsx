import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

export default function MedicineTracker() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <header className="header">
                <div className="container">
                    <h1>Medicine Tracker</h1>
                </div>
            </header>

            <div className="container">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Today's Schedule</h2>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <i className="fas fa-plus"></i> Add Medicine
                        </button>
                    </div>

                    <div className="medicine-grid">
                        <div className="medicine-card card">
                            <div className="medicine-status status-taken"></div>
                            <div className="medicine-details">
                                <div className="medicine-icon"><i className="fas fa-pills"></i></div>
                                <div>
                                    <h3>Amoxicillin</h3>
                                    <p>500mg tablet</p>
                                </div>
                            </div>
                            <p><i className="fas fa-clock"></i> 8:00 AM, 8:00 PM</p>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Mark as Taken</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Logic via Conditional Rendering */}
            {showModal && (
                <>
                    <div className="form-overlay" style={{ display: 'block' }} onClick={() => setShowModal(false)}></div>
                    <div className="add-medicine-form" style={{ display: 'block' }}>
                        <h2>Add New Medicine</h2>
                        <input type="text" className="input" placeholder="Medicine Name" />
                        <input type="text" className="input" placeholder="Dosage" />
                        <input type="time" className="input" placeholder="Time" />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Add</button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

            <BottomNav />
        </>
    );
}