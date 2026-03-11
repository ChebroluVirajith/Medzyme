import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

const availableSymptoms = ["fever", "cough", "fatigue", "headache", "nausea"];

export default function Diagnosis() {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const toggleSymptom = (symptom) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
        );
    };

    const handleDiagnosis = () => {
        if (selectedSymptoms.length === 0) return alert('Select symptoms first');
        
        setIsAnalyzing(true);
        setResult(null);

        // Simulate API/calculation delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult({
                disease: "Common Cold",
                confidence: 85,
                severity: "Mild",
                recommendations: ["Rest and stay hydrated", "Take over-the-counter medicine"]
            });
        }, 1500);
    };

    return (
        <>
            <header className="header"><div className="container"><h1>AI Diagnosis</h1></div></header>
            
            <main className="container">
                <div className="card">
                    <h2>Symptom Checker</h2>
                    <p>Select your symptoms for an AI-powered preliminary diagnosis.</p>

                    <div className="symptoms-grid">
                        {availableSymptoms.map(symp => (
                            <label key={symp} className="symptom-checkbox" style={{ opacity: 1, transform: 'none' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedSymptoms.includes(symp)}
                                    onChange={() => toggleSymptom(symp)}
                                />
                                {symp.charAt(0).toUpperCase() + symp.slice(1)}
                            </label>
                        ))}
                    </div>

                    <button className="btn btn-primary" style={{marginTop: '1rem'}} onClick={handleDiagnosis}>
                        Get Diagnosis
                    </button>
                </div>

                {isAnalyzing && (
                    <div className="loading" style={{display: 'block'}}>
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Analyzing your symptoms...</p>
                    </div>
                )}

                {result && (
                    <div className="diagnosis-result card" style={{display: 'block', animation: 'slideUp 0.5s ease-out'}}>
                        <h3>Preliminary Diagnosis</h3>
                        <div className="condition-item">
                            <h5>{result.disease}</h5>
                            <span>{result.confidence}% match</span>
                        </div>
                        <h4>Recommended Actions</h4>
                        <ul className="recommendation-list">
                            {result.recommendations.map((rec, i) => (
                                <li key={i}><i className="fas fa-check-circle"></i> {rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
            <BottomNav />
        </>
    );
}