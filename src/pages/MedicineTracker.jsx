import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import {
    collection, addDoc, getDocs, deleteDoc,
    doc, updateDoc, query, where
} from 'firebase/firestore';
import {
    ref, uploadBytes, getDownloadURL, deleteObject
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
    const [uploadError, setUploadError] = useState(null);

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

    // Get user from localStorage - FIXED: Better user detection
    useEffect(() => {
        const initializeUser = () => {
            try {
                const stored = localStorage.getItem('user');
                console.log('📱 Checking localStorage for user...');
                
                if (stored) {
                    const parsedUser = JSON.parse(stored);
                    if (!parsedUser.uid) {
                        console.log('❌ User found but missing uid. Clearing broken session.');
                        localStorage.removeItem('user');
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                    console.log('✅ User found:', parsedUser.uid);
                    setUser(parsedUser);
                    
                    // Set a fallback timer in case Firebase gets completely stuck on network
                    const fallbackTimer = setTimeout(() => {
                        console.warn('Firebase query timeout. Force clearing loader.');
                        setLoading(false);
                    }, 5000);

                    Promise.all([
                        fetchMedicines(parsedUser.uid),
                        fetchRecords(parsedUser.uid)
                    ]).finally(() => {
                        clearTimeout(fallbackTimer);
                        setLoading(false);
                    });
                    
                } else {
                    console.log('❌ No user in localStorage');
                    setLoading(false);
                }
            } catch (error) {
                console.error('❌ Error initializing user:', error);
                localStorage.removeItem('user');
                setLoading(false);
            }
        };

        // Small delay to ensure localStorage is ready
        const timer = setTimeout(initializeUser, 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchMedicines = async (uid) => {
        try {
            // Load local cache first so UI feels instantaneous
            const cachedMeds = localStorage.getItem(`medicines_${uid}`);
            if (cachedMeds) setMedicines(JSON.parse(cachedMeds));

            const q = query(collection(db, 'medicines'), where('uid', '==', uid));
            // Setting a 4.5 second threshold for fetching medicines as a safeguard
            const snapshot = await Promise.race([
                getDocs(q),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout fetching medicines")), 4500))
            ]);
            const serverMeds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            setMedicines(serverMeds);
            localStorage.setItem(`medicines_${uid}`, JSON.stringify(serverMeds));
        } catch (err) {
            console.warn('Database offline, using local medicines cache.', err.message);
        }
    };

    const fetchRecords = async (uid) => {
        try {
            // Load local cache first so UI feels instantaneous
            const cachedRecords = localStorage.getItem(`records_${uid}`);
            if (cachedRecords) setRecords(JSON.parse(cachedRecords));

            const q = query(collection(db, 'healthRecords'), where('uid', '==', uid));
            const snapshot = await Promise.race([
                getDocs(q),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout fetching records")), 4500))
            ]);
            const serverRecs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            setRecords(serverRecs);
            localStorage.setItem(`records_${uid}`, JSON.stringify(serverRecs));
        } catch (err) {
            console.warn('Database offline, using local records cache.', err.message);
        }
    };

    // Auto-save any local state changes to local storage so they don't disappear on refresh when offline
    useEffect(() => {
        if (user && user.uid && medicines.length > 0) {
            localStorage.setItem(`medicines_${user.uid}`, JSON.stringify(medicines));
        }
    }, [medicines, user]);

    useEffect(() => {
        if (user && user.uid && records.length > 0) {
            localStorage.setItem(`records_${user.uid}`, JSON.stringify(records));
        }
    }, [records, user]);

    // Background job to check for missed medicines and send email alerts
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (!user || !user.email) return;
            
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();

            medicines.forEach(async (med) => {
                // Ignore if already taken, lacks a time string, or we've already emailed them about it
                if (med.taken || med.alertSent || !med.time) return;

                try {
                    // Try to parse strings like "08:00 AM", "8 PM", "14:30"
                    const timeMatch = med.time.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
                    if (!timeMatch) return;

                    let medHour = parseInt(timeMatch[1], 10);
                    const medMin = parseInt(timeMatch[2] || '0', 10);
                    const ampm = timeMatch[3];

                    if (ampm) {
                        if (ampm.toUpperCase() === 'PM' && medHour < 12) medHour += 12;
                        if (ampm.toUpperCase() === 'AM' && medHour === 12) medHour = 0;
                    }

                    // Check if current time has passed the scheduled medicine time
                    const isTimePassed = (currentHours > medHour) || (currentHours === medHour && currentMinutes >= medMin);

                    if (isTimePassed) {
                        console.log(`⏲️ Sending missed medication email for: ${med.name}`);
                        
                        // Optimistically mark as alerted to prevent spam loops
                        setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, alertSent: true } : m));

                        // Hit our new backend email endpoint
                        try {
                            await fetch('http://localhost:5000/api/notify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: user.email,
                                    name: user.name,
                                    medicine: med.name,
                                    time: med.time
                                })
                            });
                            console.log(`✅ Email sent successfully for ${med.name}`);
                        } catch (apiErr) {
                            console.error("❌ Failed to contact backend for email:", apiErr);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing medicine time:", e);
                }
            });
        }, 10000); // Check every 10 seconds for demo purposes (usually 60000 / 1 minute)
        
        return () => clearInterval(checkInterval);
    }, [medicines, user]);

    // Upload file to Firebase Storage
    const uploadFile = async (file, uid) => {
        // Validate inputs
        if (!file) throw new Error('No file provided');
        if (!uid) throw new Error('User ID is required for upload');

        // Validate file size (10MB max)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
        }

        console.log('📤 Starting file upload:', file.name);

        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 50);
        const filePath = `healthRecords/${uid}/${timestamp}_${cleanName}`;

        console.log('📍 Upload path:', filePath);

        const storageRef = ref(storage, filePath);

        try {
            // Fake progress to assure user something is happening
            setUploadProgress(30);
            
            // Upload the actual file directly
            const snapshot = await uploadBytes(storageRef, file, {
                contentType: file.type || 'application/octet-stream',
            });
            
            setUploadProgress(70);
            console.log('✅ Upload physically complete, fetching download URL...');
            
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('✅ Download URL successfully retrieved.');
            
            setUploadProgress(100);
            return { downloadURL, filePath };
        } catch (err) {
            console.error('❌ Upload error:', err);
            let userMsg = 'Upload failed: ';
            if (err.code === 'storage/unauthorized') {
                userMsg += 'Not authorized. Check Firebase security rules for Storage. Did you make them public?';
            } else if (err.code === 'storage/unknown') {
                userMsg += 'Network error. Check your connection.';
            } else {
                userMsg += err.message;
            }
            throw new Error(userMsg);
        }
    };

    const addMedicine = async () => {
        if (!newMedicine.name) {
            alert('Please enter a medicine name');
            return;
        }

        const medData = {
            id: Date.now().toString(), // Create a local ID as a fallback immediately
            ...newMedicine,
            taken: false,
            alertSent: false, // Make sure new medicines default to false so they can trigger future alerts
            uid: user?.uid || 'offline',
            createdAt: new Date().toISOString(),
        };

        // OPTIMISTIC UPDATE: Update UI instantly, skipping the database wait
        setMedicines(prev => [...prev, medData]);
        setNewMedicine({ name: '', dosage: '', time: '' });
        setShowMedicineModal(false);

        // Try silently saving to the database in background
        if (user && user.uid) {
            try {
                // Remove ID so firestore can auto-generate a true one
                const { id, ...saveData } = medData;
                const docRef = await addDoc(collection(db, 'medicines'), saveData);
                
                // Update our local UI ID with the real database ID
                setMedicines(prev => prev.map(m => m.id === medData.id ? { ...m, id: docRef.id } : m));
            } catch (err) {
                console.warn('Database unreachable. Medicine saved locally.', err);
            }
        }
    };

    const toggleTaken = async (medicineId, currentStatus) => {
        // Optimistic UI toggle immediately
        setMedicines(medicines.map(med =>
            med.id === medicineId ? { ...med, taken: !currentStatus } : med
        ));

        // Attempt silent DB update
        try {
            // Only update DB if the ID is a real string and not a Date.now number we locally generated
            if (typeof medicineId === 'string' && medicineId.length > 15) {
                const medicineRef = doc(db, 'medicines', medicineId);
                await updateDoc(medicineRef, { taken: !currentStatus });
            }
        } catch (err) {
            console.warn('Database unreachable. Status updated locally.', err);
        }
    };

    const deleteMedicine = async (medicineId) => {
        if (window.confirm('Delete this medicine?')) {
            // Optimistic deletion
            setMedicines(medicines.filter(med => med.id !== medicineId));

            try {
                if (typeof medicineId === 'string' && medicineId.length > 15) {
                    await deleteDoc(doc(db, 'medicines', medicineId));
                }
            } catch (err) {
                console.warn('Database unreachable. Deleted locally.', err);
            }
        }
    };

    const deleteRecord = async (recordId, filePath) => {
        if (window.confirm('Delete this record?')) {
            // Optimistic deletion instantly updates screen
            setRecords(records.filter(rec => rec.id !== recordId));

            try {
                if (filePath) {
                    try {
                        const fileRef = ref(storage, filePath);
                        await deleteObject(fileRef);
                    } catch (storageErr) {
                        console.warn('Could not delete file from storage:', storageErr);
                    }
                }
                
                if (typeof recordId === 'string' && recordId.length > 15) {
                    await deleteDoc(doc(db, 'healthRecords', recordId));
                }
            } catch (err) {
                console.warn('Database unreachable. Deleted locally.', err);
            }
        }
    };

    const addRecord = async () => {
        // FIXED: Check user BEFORE attempting save
        if (!user || !user.uid) {
            alert('❌ User not authenticated. Please log in again.');
            console.error('❌ User is missing or has no uid:', user);
            return;
        }

        if (!newRecord.type) {
            alert('Please select a record type.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        let fileData = { fileName: '', fileUrl: '', fileType: '', filePath: '' };

        try {
            // Upload file if selected
            if (selectedFile) {
                try {
                    console.log('📤 Uploading file with UID:', user.uid);
                    const { downloadURL, filePath } = await uploadFile(selectedFile, user.uid);
                    fileData = {
                        fileName: selectedFile.name,
                        fileUrl: downloadURL,
                        fileType: selectedFile.type,
                        filePath: filePath,
                    };
                    console.log('✅ File uploaded successfully');
                } catch (uploadErr) {
                    console.error('❌ File upload failed:', uploadErr);
                    const proceed = window.confirm(
                        'File upload failed: ' + uploadErr.message + '\n\nSave record locally without file attached?'
                    );
                    if (!proceed) {
                        setUploading(false);
                        return;
                    }
                }
            }

            const recordData = {
                id: Date.now().toString(), // local fallback ID
                type: newRecord.type,
                date: newRecord.date,
                doctor: newRecord.doctor,
                notes: newRecord.notes,
                ...fileData,
                uid: user.uid,
                createdAt: new Date().toISOString(),
            };

            // OPTIMISTIC UPDATE: Save to UI immediately without waiting for database!
            setRecords(prev => [...prev, recordData]);
            
            // Clean up UI instantly
            setNewRecord({ type: '', date: '', doctor: '', notes: '', fileName: '', fileUrl: '', fileType: '', filePath: '' });
            setSelectedFile(null);
            setUploadProgress(0);
            setUploadError(null);
            setUploading(false);
            setShowRecordModal(false);

            // Try silently saving to database in the background
            try {
                const { id, ...saveData } = recordData;
                const docRef = await Promise.race([
                    addDoc(collection(db, 'healthRecords'), saveData),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout block')), 5000))
                ]);
                
                // Replace local ID with DB ID when/if done
                setRecords(prev => prev.map(r => r.id === recordData.id ? { ...r, id: docRef.id } : r));
            } catch (err) {
                console.warn('Database unreachable. Record saved locally.', err);
                // Optionally let them know it saved offline
            }

        } catch (err) {
            console.error('❌ Error saving record:', err);
            setUploadError('Error saving record: ' + err.message);
            setUploading(false);
            setUploadProgress(0);
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
                    <div className="add-medicine-form" style={{ display: 'block', maxHeight: '90vh', overflowY: 'auto' }}>
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
                            onClick={() => !uploading && document.getElementById('record-file-upload').click()}
                            style={{
                                border: '2px dashed',
                                borderColor: selectedFile ? '#10b981' : '#d1d5db',
                                borderRadius: '10px', padding: '20px',
                                textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
                                background: selectedFile ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.2s ease',
                                opacity: uploading ? 0.6 : 1,
                            }}
                            onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = '#667eea')}
                            onMouseLeave={e => !uploading && (e.currentTarget.style.borderColor = selectedFile ? '#10b981' : '#d1d5db')}
                        >
                            <input
                                id="record-file-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={e => setSelectedFile(e.target.files[0] || null)}
                                disabled={uploading}
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
                                        Attach File (Optional)
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '600' }}>Uploading...</span>
                                    <span style={{ fontSize: '0.82rem', color: '#667eea', fontWeight: '600' }}>{uploadProgress}%</span>
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '999px',
                                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                        width: `${uploadProgress}%`,
                                        transition: 'width 0.3s ease',
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {uploadError && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '0.85rem',
                            }}>
                                ⚠️ {uploadError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ 
                                    flex: 1, 
                                    opacity: uploading ? 0.7 : 1, 
                                    cursor: uploading ? 'not-allowed' : 'pointer' 
                                }}
                                onClick={() => {
                                    if (!uploading) addRecord();
                                }}
                            >
                                {uploading ? `Uploading ${uploadProgress}%...` : 'Save Record'}
                            </button>
                            <button 
                                className="btn" 
                                style={{ flex: 1, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
                                onClick={() => {
                                    if (!uploading) {
                                        setShowRecordModal(false);
                                        setSelectedFile(null);
                                        setNewRecord({ type: '', date: '', doctor: '', notes: '', fileName: '', fileUrl: '', fileType: '', filePath: '' });
                                        setUploadError(null);
                                    }
                                }}
                                disabled={uploading}
                            >
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