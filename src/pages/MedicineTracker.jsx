import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

export default function MedicineTracker() {
    const [activeTab, setActiveTab] = useState('medicines');
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);

    const [medicines, setMedicines] = useState([
        { id: 1, name: 'Amoxicillin', dosage: '500mg tablet', time: '8:00 AM, 8:00 PM', taken: false }
    ]);

    const [records, setRecords] = useState([
        { id: 1, type: 'Blood Test', date: '2025-03-01', doctor: 'Dr. Smith', notes: 'All values normal', file: null }
    ]);

    const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', time: '' });
    const [newRecord, setNewRecord] = useState({ type: '', date: '', doctor: '', notes: '', file: null });

    const recordTypes = ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Vaccination', 'Lab Report', 'Other'];

    const addMedicine = () => {
        if (!newMedicine.name) return;
        setMedicines([...medicines, { id: Date.now(), ...newMedicine, taken: false }]);
        setNewMedicine({ name: '', dosage: '', time: '' });
        setShowMedicineModal(false);
    };

    const addRecord = () => {
        if (!newRecord.type) return;
        setRecords([...records, { id: Date.now(), ...newRecord }]);
        setNewRecord({ type: '', date: '', doctor: '', notes: '', file: null });
        setShowRecordModal(false);
    };

    const toggleTaken = (id) => {
        setMedicines(medicines.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    };

    const deleteRecord = (id) => {
        setRecords(records.filter(r => r.id !== id));
    };

    const recordTypeIcon = (type) => {
        const icons = {
            'Blood Test': '🩸',
            'X-Ray': '🦴',
            'MRI': '🧠',
            'Prescription': '💊',
            'Vaccination': '💉',
            'Lab Report': '🔬',
            'Other': '📄',
        };
        return icons[type] || '📄';
    };

    return (
        <>
            <header className="header">
                <div className="container">
                    <h1>Health Manager</h1>
                </div>
            </header>

            <div className="container">
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '24px',
                    gap: '4px',
                }}>
                    {[
                        { key: 'medicines', label: '💊 Medicines' },
                        { key: 'records', label: '📋 Health Records' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                background: activeTab === tab.key
                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                    : 'transparent',
                                color: activeTab === tab.key ? 'white' : '#6b7280',
                                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── MEDICINES TAB ── */}
                {activeTab === 'medicines' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Today's Schedule</h2>
                            <button className="btn btn-primary" onClick={() => setShowMedicineModal(true)}>
                                <i className="fas fa-plus"></i> Add Medicine
                            </button>
                        </div>

                        {medicines.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💊</div>
                                <p>No medicines added yet</p>
                            </div>
                        )}

                        <div className="medicine-grid">
                            {medicines.map(med => (
                                <div key={med.id} className="medicine-card card" style={{
                                    opacity: med.taken ? 0.6 : 1,
                                    borderLeft: med.taken ? '4px solid #10b981' : '4px solid #667eea',
                                }}>
                                    <div className={`medicine-status ${med.taken ? 'status-taken' : ''}`}></div>
                                    <div className="medicine-details">
                                        <div className="medicine-icon"><i className="fas fa-pills"></i></div>
                                        <div>
                                            <h3 style={{ textDecoration: med.taken ? 'line-through' : 'none' }}>{med.name}</h3>
                                            <p>{med.dosage}</p>
                                        </div>
                                    </div>
                                    {med.time && <p><i className="fas fa-clock"></i> {med.time}</p>}
                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            marginTop: '1rem',
                                            background: med.taken
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : 'linear-gradient(135deg, #667eea, #764ba2)',
                                        }}
                                        onClick={() => toggleTaken(med.id)}
                                    >
                                        {med.taken ? '✓ Taken' : 'Mark as Taken'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── HEALTH RECORDS TAB ── */}
                {activeTab === 'records' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Health Records</h2>
                            <button className="btn btn-primary" onClick={() => setShowRecordModal(true)}>
                                <i className="fas fa-plus"></i> Add Record
                            </button>
                        </div>

                        {records.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                                <p>No health records added yet</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {records.map(record => (
                                <div key={record.id} style={{
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(102,126,234,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.6rem',
                                        flexShrink: 0,
                                    }}>
                                        {recordTypeIcon(record.type)}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1rem', fontWeight: '600' }}>
                                                    {record.type}
                                                </h3>
                                                {record.doctor && (
                                                    <p style={{ margin: '0 0 4px', color: '#6b7280', fontSize: '0.85rem' }}>
                                                        👨‍⚕️ {record.doctor}
                                                    </p>
                                                )}
                                                {record.date && (
                                                    <p style={{ margin: '0 0 6px', color: '#9ca3af', fontSize: '0.82rem' }}>
                                                        📅 {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                )}
                                                {record.notes && (
                                                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                        {record.notes}
                                                    </p>
                                                )}
                                                {record.file && (
                                                    <p style={{ margin: '6px 0 0', color: '#667eea', fontSize: '0.85rem', fontWeight: '500' }}>
                                                        📎 {record.file.name}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteRecord(record.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '1.1rem',
                                                    padding: '4px',
                                                    borderRadius: '6px',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                title="Delete record"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── ADD MEDICINE MODAL ── */}
            {showMedicineModal && (
                <>
                    <div className="form-overlay" style={{ display: 'block' }} onClick={() => setShowMedicineModal(false)}></div>
                    <div className="add-medicine-form" style={{ display: 'block' }}>
                        <h2>Add New Medicine</h2>
                        <input
                            type="text"
                            className="input"
                            placeholder="Medicine Name *"
                            value={newMedicine.name}
                            onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Dosage (e.g. 500mg tablet)"
                            value={newMedicine.dosage}
                            onChange={e => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Time (e.g. 8:00 AM, 8:00 PM)"
                            value={newMedicine.time}
                            onChange={e => setNewMedicine({ ...newMedicine, time: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addMedicine}>Add</button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setShowMedicineModal(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

            {/* ── ADD HEALTH RECORD MODAL ── */}
            {showRecordModal && (
                <>
                    <div className="form-overlay" style={{ display: 'block' }} onClick={() => setShowRecordModal(false)}></div>
                    <div className="add-medicine-form" style={{ display: 'block' }}>
                        <h2>Add Health Record</h2>

                        <select
                            className="input"
                            value={newRecord.type}
                            onChange={e => setNewRecord({ ...newRecord, type: e.target.value })}
                            style={{ appearance: 'auto' }}
                        >
                            <option value="">Select Record Type *</option>
                            {recordTypes.map(t => <option key={t} value={t}>{recordTypeIcon(t)} {t}</option>)}
                        </select>

                        <input
                            type="date"
                            className="input"
                            value={newRecord.date}
                            onChange={e => setNewRecord({ ...newRecord, date: e.target.value })}
                        />

                        <input
                            type="text"
                            className="input"
                            placeholder="Doctor's Name"
                            value={newRecord.doctor}
                            onChange={e => setNewRecord({ ...newRecord, doctor: e.target.value })}
                        />

                        <textarea
                            className="input"
                            placeholder="Notes (e.g. all values normal)"
                            value={newRecord.notes}
                            onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />

                        <div style={{
                            border: '2px dashed #d1d5db',
                            borderRadius: '10px',
                            padding: '16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: '0.9rem',
                            marginTop: '4px',
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#667eea'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        onClick={() => document.getElementById('file-upload').click()}
                        >
                            📎 {newRecord.file ? newRecord.file.name : 'Attach file (optional)'}
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                onChange={e => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addRecord}>Save Record</button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setShowRecordModal(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

            <BottomNav />
        </>
    );
}