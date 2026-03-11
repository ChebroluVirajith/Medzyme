import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import {
    collection, addDoc, getDocs, deleteDoc,
    doc, updateDoc, query, where
} from 'firebase/firestore';
import {
    ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage';
import BottomNav from '../components/BottomNav';

export default function MedicineTracker() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('medicines');
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [medicines, setMedicines] = useState([]);
    const [records, setRecords] = useState([]);

    const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', time: '' });
    const [newRecord, setNewRecord] = useState({
        type: '', date: '', doctor: '', notes: '',
        fileName: '', fileUrl: '', fileType: '', filePath: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const recordTypes = ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Vaccination', 'Lab Report', 'Other'];

    const recordTypeIcon = (type) => ({
        'Blood Test': '🩸', 'X-Ray': '🦴', 'MRI': '🧠',
        'Prescription': '💊', 'Vaccination': '💉',
        'Lab Report': '🔬', 'Other': '📄',
    }[type] || '📄');

    // Get user from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
            fetchMedicines(parsedUser.uid);
            fetchRecords(parsedUser.uid);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchMedicines = async (uid) => {
        setLoading(true);
        try {
            const q = query(collection(db, 'medicines'), where('uid', '==', uid));
            const snapshot = await getDocs(q);
            setMedicines(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching medicines:', err);
        }
        setLoading(false);
    };

    const fetchRecords = async (uid) => {
        try {
            const q = query(collection(db, 'healthRecords'), where('uid', '==', uid));
            const snapshot = await getDocs(q);
            setRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching records:', err);
        }
    };

    // Upload file to Firebase Storage
    const uploadFile = (file, uid) => {
    return new Promise((resolve, reject) => {
        console.log('Starting upload:', file.name, file.size, file.type);
        
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `healthRecords/${uid}/${timestamp}_${cleanName}`;
        
        console.log('Upload path:', filePath);
        console.log('Storage bucket:', storage.app.options.storageBucket);

        const storageRef = ref(storage, filePath);
        
        const uploadTask = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
        });

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                console.log('Upload progress:', progress, '%');
                setUploadProgress(progress);
            },
            (error) => {
                console.error('Upload error code:', error.code);
                console.error('Upload error message:', error.message);
                console.error('Upload error details:', error);
                reject(error);
            },
            async () => {
                console.log('Upload complete!');
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Download URL:', downloadURL);
                resolve({ downloadURL, filePath });
            }
        );
    });
};
    const addMedicine = async () => {
        if (!newMedicine.name || !user) return;
        try {
            const docRef = await addDoc(collection(db, 'medicines'), {
                ...newMedicine,
                taken: false,
                uid: user.uid,
                createdAt: new Date().toISOString(),
            });
            setMedicines([...medicines, { id: docRef.id, ...newMedicine, taken: false, uid: user.uid }]);
            setNewMedicine({ name: '', dosage: '', time: '' });
            setShowMedicineModal(false);
        } catch (err) {
            console.error('Error adding medicine:', err);
        }
    };

    const addRecord = async () => {
    if (!newRecord.type || !user) return;
    setUploading(true);
    setUploadProgress(0);

    try {
        let fileData = { fileName: '', fileUrl: '', fileType: '', filePath: '' };

        if (selectedFile) {
            console.log('File selected:', selectedFile.name);
            console.log('User uid:', user.uid);
            
            try {
                const { downloadURL, filePath } = await uploadFile(selectedFile, user.uid);
                fileData = {
                    fileName: selectedFile.name,
                    fileUrl: downloadURL,
                    fileType: selectedFile.type,
                    filePath: filePath,
                };
            } catch (uploadErr) {
                console.error('File upload failed:', uploadErr);
                alert('File upload failed: ' + uploadErr.message + '\nSaving record without file.');
                // Continue saving record without file
            }
        }

        const recordData = {
            type: newRecord.type,
            date: newRecord.date,
            doctor: newRecord.doctor,
            notes: newRecord.notes,
            ...fileData,
            uid: user.uid,
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'healthRecords'), recordData);
        setRecords([...records, { id: docRef.id, ...recordData }]);
        setNewRecord({ type: '', date: '', doctor: '', notes: '', fileName: '', fileUrl: '', fileType: '', filePath: '' });
        setSelectedFile(null);
        setShowRecordModal(false);
    } catch (err) {
        console.error('Error saving record:', err);
        alert('Error saving record: ' + err.message);
    }
    
    setUploading(false);
    setUploadProgress(0);
};
    const toggleTaken = async (id, currentTaken) => {
        try {
            await updateDoc(doc(db, 'medicines', id), { taken: !currentTaken });
            setMedicines(medicines.map(m => m.id === id ? { ...m, taken: !currentTaken } : m));
        } catch (err) {
            console.error('Error updating:', err);
        }
    };

    const deleteMedicine = async (id) => {
        try {
            await deleteDoc(doc(db, 'medicines', id));
            setMedicines(medicines.filter(m => m.id !== id));
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const deleteRecord = async (id, filePath) => {
        try {
            // Delete file from Storage if exists
            if (filePath) {
                const fileRef = ref(storage, filePath);
                await deleteObject(fileRef).catch(() => {}); // ignore if already deleted
            }
            await deleteDoc(doc(db, 'healthRecords', id));
            setRecords(records.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error deleting record:', err);
        }
    };

    if (!user && !loading) {
        return (
            <>
                <header className="header">
                    <div className="container"><h1>Health Manager</h1></div>
                </header>
                <div className="container">
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                        <h2 style={{ marginBottom: '12px' }}>Sign in to access your records</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                            Your medicines and health records are saved securely to your account.
                        </p>
                        <a href="/signup" className="btn btn-primary">Sign Up / Login</a>
                    </div>
                </div>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <header className="header">
                <div className="container"><h1>Health Manager</h1></div>
            </header>

            <div className="container">
                {/* Tabs */}
                <div style={{
                    display: 'flex', background: '#f3f4f6', borderRadius: '12px',
                    padding: '4px', marginBottom: '24px', gap: '4px',
                }}>
                    {[
                        { key: 'medicines', label: '💊 Medicines' },
                        { key: 'records', label: '📋 Health Records' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                            cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            background: activeTab === tab.key ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#6b7280',
                            boxShadow: activeTab === tab.key ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        <div style={{
                            width: '40px', height: '40px', margin: '0 auto 16px',
                            border: '3px solid #e5e7eb', borderTop: '3px solid #667eea',
                            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                        }} />
                        <p>Loading your data...</p>
                    </div>
                )}

                {/* Medicines Tab */}
                {!loading && activeTab === 'medicines' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Today's Schedule</h2>
                            <button className="btn btn-primary" onClick={() => setShowMedicineModal(true)}>+ Add Medicine</button>
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
                                    opacity: med.taken ? 0.7 : 1,
                                    borderLeft: med.taken ? '4px solid #10b981' : '4px solid #667eea',
                                }}>
                                    <div className="medicine-details">
                                        <div className="medicine-icon"><i className="fas fa-pills"></i></div>
                                        <div>
                                            <h3 style={{ textDecoration: med.taken ? 'line-through' : 'none' }}>{med.name}</h3>
                                            <p>{med.dosage}</p>
                                        </div>
                                    </div>
                                    {med.time && <p><i className="fas fa-clock"></i> {med.time}</p>}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                                        <button className="btn btn-primary" style={{
                                            flex: 1,
                                            background: med.taken
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : 'linear-gradient(135deg, #667eea, #764ba2)',
                                        }} onClick={() => toggleTaken(med.id, med.taken)}>
                                            {med.taken ? '✓ Taken' : 'Mark as Taken'}
                                        </button>
                                        <button onClick={() => deleteMedicine(med.id)} style={{
                                            background: 'none', border: '1px solid #fca5a5',
                                            color: '#ef4444', borderRadius: '8px',
                                            padding: '0 12px', cursor: 'pointer', fontSize: '1rem',
                                        }}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Health Records Tab */}
                {!loading && activeTab === 'records' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Health Records</h2>
                            <button className="btn btn-primary" onClick={() => setShowRecordModal(true)}>+ Add Record</button>
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
                                    background: '#f9fafb', borderRadius: '12px', padding: '20px',
                                    border: '1px solid #e5e7eb', display: 'flex',
                                    alignItems: 'flex-start', gap: '16px', transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(102,126,234,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <div style={{
                                        width: '52px', height: '52px', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                                        borderRadius: '12px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                                    }}>
                                        {recordTypeIcon(record.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
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
                                                    <p style={{ margin: '0 0 8px', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                        {record.notes}
                                                    </p>
                                                )}

                                                {/* File attachment display */}
                                                {record.fileName && (
                                                    <div style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                        padding: '6px 12px', background: '#f3f4f6',
                                                        borderRadius: '8px', border: '1px solid #e5e7eb',
                                                    }}>
                                                        <span>
                                                            {record.fileType?.includes('pdf') ? '📄' :
                                                             record.fileType?.includes('image') ? '🖼️' : '📎'}
                                                        </span>
                                                        <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: '500', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {record.fileName}
                                                        </span>
                                                        {record.fileType?.includes('image') && (
                                                            <a href={record.fileUrl} target="_blank" rel="noreferrer" style={{
                                                                fontSize: '0.78rem', color: '#10b981', fontWeight: '600',
                                                                textDecoration: 'none', padding: '2px 8px',
                                                                background: '#d1fae5', borderRadius: '6px',
                                                            }}>
                                                                View
                                                            </a>
                                                        )}
                                                        <a href={record.fileUrl} download={record.fileName} style={{
                                                            fontSize: '0.78rem', color: '#667eea', fontWeight: '600',
                                                            textDecoration: 'none', padding: '2px 8px',
                                                            background: '#ede9fe', borderRadius: '6px',
                                                        }}>
                                                            Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={() => deleteRecord(record.id, record.filePath)} style={{
                                                background: 'none', border: 'none', color: '#ef4444',
                                                cursor: 'pointer', fontSize: '1.1rem', padding: '4px',
                                                borderRadius: '6px', transition: 'background 0.2s', flexShrink: 0,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Medicine Modal */}
            {showMedicineModal && (
                <>
                    <div className="form-overlay" style={{ display: 'block' }} onClick={() => setShowMedicineModal(false)}></div>
                    <div className="add-medicine-form" style={{ display: 'block' }}>
                        <h2>Add New Medicine</h2>
                        <input type="text" className="input" placeholder="Medicine Name *"
                            value={newMedicine.name} onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })} />
                        <input type="text" className="input" placeholder="Dosage (e.g. 500mg)"
                            value={newMedicine.dosage} onChange={e => setNewMedicine({ ...newMedicine, dosage: e.target.value })} />
                        <input type="text" className="input" placeholder="Time (e.g. 8:00 AM)"
                            value={newMedicine.time} onChange={e => setNewMedicine({ ...newMedicine, time: e.target.value })} />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addMedicine}>Add</button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setShowMedicineModal(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}

            {/* Add Health Record Modal */}
            {showRecordModal && (
                <>
                    <div className="form-overlay" style={{ display: 'block' }} onClick={() => setShowRecordModal(false)}></div>
                    <div className="add-medicine-form" style={{ display: 'block' }}>
                        <h2>Add Health Record</h2>

                        <select className="input" value={newRecord.type}
                            onChange={e => setNewRecord({ ...newRecord, type: e.target.value })}
                            style={{ appearance: 'auto' }}>
                            <option value="">Select Record Type *</option>
                            {recordTypes.map(t => <option key={t} value={t}>{recordTypeIcon(t)} {t}</option>)}
                        </select>

                        <input type="date" className="input" value={newRecord.date}
                            onChange={e => setNewRecord({ ...newRecord, date: e.target.value })} />

                        <input type="text" className="input" placeholder="Doctor's Name"
                            value={newRecord.doctor} onChange={e => setNewRecord({ ...newRecord, doctor: e.target.value })} />

                        <textarea className="input" placeholder="Notes" rows={3}
                            value={newRecord.notes} onChange={e => setNewRecord({ ...newRecord, notes: e.target.value })}
                            style={{ resize: 'vertical' }} />

                        {/* File Upload */}
                        <div
                            onClick={() => document.getElementById('record-file-upload').click()}
                            style={{
                                border: '2px dashed',
                                borderColor: selectedFile ? '#10b981' : '#d1d5db',
                                borderRadius: '10px', padding: '20px',
                                textAlign: 'center', cursor: 'pointer',
                                background: selectedFile ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#667eea'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = selectedFile ? '#10b981' : '#d1d5db'}
                        >
                            <input
                                id="record-file-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={e => setSelectedFile(e.target.files[0] || null)}
                            />
                            {selectedFile ? (
                                <div>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
                                        {selectedFile.type?.includes('pdf') ? '📄' :
                                         selectedFile.type?.includes('image') ? '🖼️' : '📎'}
                                    </div>
                                    <p style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>
                                        {selectedFile.name}
                                    </p>
                                    <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '4px 0 0' }}>
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📎</div>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                                        Attach File
                                    </p>
                                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '4px 0 0' }}>
                                        PDF, JPG, PNG, DOC · Max 10MB
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Progress Bar */}
                        {uploading && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Uploading...</span>
                                    <span style={{ fontSize: '0.82rem', color: '#667eea', fontWeight: '600' }}>{uploadProgress}%</span>
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '999px',
                                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                        width: `${uploadProgress}%`,
                                        transition: 'width 0.3s ease',
                                    }} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1, opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
                                onClick={addRecord}
                                disabled={uploading}
                            >
                                {uploading ? `Uploading ${uploadProgress}%...` : 'Save Record'}
                            </button>
                            <button className="btn" style={{ flex: 1 }} onClick={() => {
                                setShowRecordModal(false);
                                setSelectedFile(null);
                                setNewRecord({ type: '', date: '', doctor: '', notes: '', fileName: '', fileUrl: '', fileType: '', filePath: '' });
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

            <BottomNav />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}