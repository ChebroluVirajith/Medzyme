import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';

const diseaseDataset = [
    { 
        name: "Common Cold", 
        symptoms: ["cough", "runny nose", "sore throat", "mild fever", "fatigue"],
        precautions: ["Rest and stay hydrated", "Use saline nasal drops", "Gargle with warm salt water"],
        drugs: ["Acetaminophen (Paracetamol)", "Ibuprofen", "Antihistamines (e.g., Cetirizine)", "Decongestants"]
    },
    { 
        name: "COVID-19", 
        symptoms: ["fever", "dry cough", "tiredness", "loss of taste", "loss of smell", "difficulty breathing", "sore throat"],
        precautions: ["Isolate yourself", "Wear a mask", "Monitor oxygen levels", "Stay hydrated"],
        drugs: ["Paracetamol (for fever)", "Paxlovid (prescription only)", "Corticosteroids (in severe cases)"]
    },
    { 
        name: "Influenza (Flu)", 
        symptoms: ["high fever", "muscle aches", "chills", "sweats", "headache", "dry cough", "fatigue"],
        precautions: ["Get plenty of rest", "Drink warm fluids", "Avoid contact with others"],
        drugs: ["Oseltamivir (Tamiflu)", "Baloxavir marboxil (Xofluza)", "Ibuprofen (for aches/fever)"]
    },
    { 
        name: "Gastroenteritis (Stomach Bug)", 
        symptoms: ["nausea", "vomiting", "diarrhea", "stomach cramps", "mild fever"],
        precautions: ["Drink ORS (Oral Rehydration Salts)", "Eat bland food (BRAT diet)", "Maintain hygiene"],
        drugs: ["Loperamide (Imodium) for diarrhea", "Ondansetron (for nausea)", "Probiotics"]
    },
    { 
        name: "Allergies", 
        symptoms: ["sneezing", "runny nose", "itchy eyes", "watery eyes", "cough"],
        precautions: ["Avoid known allergens", "Keep windows closed", "Use air purifiers"],
        drugs: ["Loratadine (Claritin)", "Fexofenadine (Allegra)", "Fluticasone (Flonase nasal spray)"]
    },
    { 
        name: "Migraine", 
        symptoms: ["severe headache", "nausea", "sensitivity to light", "sensitivity to sound"],
        precautions: ["Rest in a dark, quiet room", "Apply a cold compress", "Manage stress and triggers"],
        drugs: ["Sumatriptan (Imitrex)", "Naproxen", "Ibuprofen"]
    },
    { 
        name: "Dengue Fever", 
        symptoms: ["high fever", "severe headache", "pain behind eyes", "joint pain", "muscle pain", "rash"],
        precautions: ["Avoid mosquito bites (use repellents)", "Rest heavily", "Drink heavy amounts of fluids like papaya leaf extract"],
        drugs: ["Acetaminophen (Paracetamol) ONLY", "AVOID Aspirin and Ibuprofen (due to bleeding risk)"]
    },
    { 
        name: "Malaria", 
        symptoms: ["chills", "high fever", "sweating", "headache", "nausea", "vomiting"],
        precautions: ["Use mosquito nets", "Wear long sleeves", "Keep surroundings clean to prevent breeding"],
        drugs: ["Artemisinin-based combination therapies (ACTs)", "Chloroquine", "Hydroxychloroquine"]
    },
    { 
        name: "Typhoid", 
        symptoms: ["prolonged fever", "weakness", "stomach pain", "headache", "diarrhea", "constipation", "cough"],
        precautions: ["Drink boiled or filtered water", "Avoid street food", "Wash hands frequently"],
        drugs: ["Ciprofloxacin", "Azithromycin", "Ceftriaxone"]
    },
    { 
        name: "Asthma", 
        symptoms: ["shortness of breath", "chest tightness", "wheezing", "coughing fits"],
        precautions: ["Avoid dust, pollen, and trigger factors", "Keep inhaler handy at all times"],
        drugs: ["Albuterol (rescue inhaler)", "Fluticasone (inhaled corticosteroid)", "Montelukast"]
    },
    { 
        name: "Bronchitis", 
        symptoms: ["cough", "mucus production", "fatigue", "shortness of breath", "slight fever", "chest discomfort"],
        precautions: ["Use a humidifier", "Avoid smoking and irritants", "Drink plenty of warm liquids"],
        drugs: ["Guaifenesin (expectorant)", "Dextromethorphan (cough suppressant)", "Albuterol inhaler (if wheezing)"]
    },
    {
        name: "Pneumonia",
        symptoms: ["cough with phlegm", "fever", "chills", "difficulty breathing", "chest pain"],
        precautions: ["Get plenty of rest", "Drink fluids", "Avoid smoking", "Get vaccinated"],
        drugs: ["Amoxicillin", "Azithromycin", "Levofloxacin", "Ibuprofen (for fever/pain)"]
    },
    {
        name: "Chickenpox",
        symptoms: ["itchy rash", "blisters", "fatigue", "fever", "loss of appetite"],
        precautions: ["Do not scratch blisters", "Take cool baths with baking soda", "Stay isolated until blisters crust over"],
        drugs: ["Calamine lotion", "Acetaminophen (for fever)", "Acyclovir (antiviral in severe cases)"]
    },
    {
        name: "Tonsillitis",
        symptoms: ["sore throat", "difficulty swallowing", "swollen tonsils", "fever", "tender lymph nodes"],
        precautions: ["Drink warm liquids/tea with honey", "Gargle salt water", "Use a humidifier"],
        drugs: ["Penicillin or Amoxicillin (if bacterial)", "Ibuprofen or Acetaminophen (for pain)"]
    }
];

const allSymptoms = Array.from(new Set(diseaseDataset.flatMap(d => d.symptoms))).sort();

export default function Telemedicine() {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [results, setResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleSymptom = (symptom) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
        );
        // Reset results if user changes symptoms
        if (results) setResults(null);
    };

    const analyzeSymptoms = () => {
        if (selectedSymptoms.length === 0) return;
        
        setIsAnalyzing(true);

        setTimeout(() => {
            let matchPercentages = [];
            let maxMatches = 0;

            diseaseDataset.forEach(disease => {
                const matchedSymptoms = disease.symptoms.filter(s => selectedSymptoms.includes(s));
                const matchCount = matchedSymptoms.length;
                const percentage = Math.round((matchCount / disease.symptoms.length) * 100);
                
                if (matchCount > 0) {
                    matchPercentages.push({ 
                        name: disease.name, 
                        percentage, 
                        matchCount, 
                        totalSymptoms: disease.symptoms.length,
                        precautions: disease.precautions,
                        drugs: disease.drugs
                    });
                }

                if (matchCount > maxMatches) {
                    maxMatches = matchCount;
                }
            });

            matchPercentages.sort((a, b) => b.percentage - a.percentage);
            
            setResults(matchPercentages);
            setIsAnalyzing(false);
        }, 1000); // Small delay for UX
    };

    const resetAnalyzer = () => {
        setSelectedSymptoms([]);
        setResults(null);
        setSearchQuery("");
    };

    const filteredSymptoms = allSymptoms.filter(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <style>{`
                .analyzer-header {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    margin-bottom: 2rem;
                }
                .analyzer-header h1 {
                    margin: 0;
                    font-size: clamp(1.8rem, 4vw, 2.2rem);
                    font-weight: 600;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .analyzer-header p {
                    margin: 8px 0 0 0;
                    font-size: 1rem;
                    opacity: 0.9;
                }
                .content-container {
                    flex: 1;
                    padding: 0 20px 90px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                    animation: fadeIn 0.4s ease-out;
                }
                .section-title {
                    margin-top: 0;
                    font-size: 1.25rem;
                    color: var(--text);
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .symptoms-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .symptom-chip {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    border: 2px solid var(--border);
                    border-radius: 8px; /* Rounded square */
                    background: var(--card);
                    color: var(--text-light);
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    user-select: none;
                }
                .symptom-chip:hover {
                    border-color: var(--primary-light);
                    color: var(--primary);
                    background: var(--primary-lighter);
                    transform: translateY(-1px);
                }
                .symptom-chip.selected {
                    background: var(--primary-lighter);
                    border-color: var(--primary);
                    color: var(--primary-dark);
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
                }
                .symptom-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary);
                    cursor: pointer;
                    margin: 0;
                    pointer-events: none; /* Let the container handle the click */
                }
                .search-input-container {
                    position: relative;
                    margin-bottom: 20px;
                }
                .search-input {
                    width: 100%;
                    padding: 14px 16px 14px 44px;
                    border: 2px solid var(--border);
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                    color: var(--text);
                    background-color: var(--background);
                }
                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-light);
                }
                .analyze-btn {
                    width: 100%;
                    padding: 16px;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px rgba(52, 211, 153, 0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    background-color: var(--success);
                    color: white;
                    margin-top: 20px;
                }
                .analyze-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .analyze-btn:disabled {
                    background: var(--border);
                    color: var(--text-light);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                .reset-btn {
                    width: 100%;
                    padding: 14px;
                    background: transparent;
                    color: var(--danger);
                    border: 2px solid var(--danger);
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 15px;
                }
                .reset-btn:hover {
                    background: var(--danger);
                    color: white;
                }
                .result-item {
                    padding: 24px;
                    border: 1px solid var(--border);
                    border-radius: 0.5rem;
                    margin-bottom: 20px;
                    background: var(--background);
                    transition: transform 0.2s;
                }
                .result-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .result-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    border-bottom: 2px solid var(--border);
                    padding-bottom: 12px;
                }
                .disease-name {
                    font-weight: 700;
                    font-size: 1.3rem;
                    color: var(--primary-dark);
                }
                .match-badge {
                    background: var(--secondary);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(129, 140, 248, 0.4);
                }
                .match-details {
                    font-size: 0.95rem;
                    color: var(--text-light);
                    margin-bottom: 15px;
                }
                .treatment-section {
                    margin-top: 15px;
                }
                .treatment-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    margin-top: 16px;
                }
                .treatment-title.precautions {
                    color: var(--primary);
                }
                .treatment-title.drugs {
                    color: var(--success);
                }
                .treatment-list {
                    margin: 0;
                    padding-left: 20px;
                    font-size: 0.95rem;
                    color: var(--text-light);
                    list-style-type: none;
                }
                .treatment-list li {
                    margin-bottom: 8px;
                    position: relative;
                }
                .treatment-list li::before {
                    content: '•';
                    color: var(--primary);
                    position: absolute;
                    left: -15px;
                    font-weight: bold;
                }
                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 0;
                }
                .loader {
                    border: 4px solid var(--border);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .disclaimer {
                    font-size: 0.9rem;
                    color: #854d0e;
                    background-color: #fef9c3;
                    border: 1px solid #fde68a;
                    padding: 16px;
                    border-radius: 0.5rem;
                    margin-top: 24px;
                    text-align: center;
                    line-height: 1.5;
                }
            `}</style>
            
            <header className="analyzer-header">
                <h1>Symptom Analyzer</h1>
                <p>Select your symptoms for a quick prediction</p>
            </header>

            <div className="content-container">
                <div className="card">
                    <h2 className="section-title"><i className="fas fa-clipboard-list" style={{color: 'var(--primary)'}}></i> What are you experiencing?</h2>
                    
                    <div className="search-input-container">
                        <i className="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search symptoms... (e.g., headache, fever)" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="symptoms-grid">
                        {filteredSymptoms.map(symptom => {
                            const isSelected = selectedSymptoms.includes(symptom);
                            return (
                                <div 
                                    key={symptom} 
                                    className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleSymptom(symptom)}
                                >
                                    <input 
                                        type="checkbox" 
                                        className="symptom-checkbox"
                                        checked={isSelected} 
                                        readOnly 
                                    />
                                    <span>{symptom}</span>
                                </div>
                            );
                        })}
                        
                        {filteredSymptoms.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-light)' }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                                <p>No symptoms found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                    
                    {!results && !isAnalyzing && (
                        <button 
                            className="analyze-btn" 
                            onClick={analyzeSymptoms}
                            disabled={selectedSymptoms.length === 0}
                        >
                            <i className="fas fa-stethoscope"></i> Check Possible Conditions
                        </button>
                    )}
                </div>

                {isAnalyzing && (
                    <div className="card loader-container">
                        <div className="loader"></div>
                        <h2 className="section-title" style={{margin: 0}}>Analyzing Symptoms...</h2>
                    </div>
                )}

                {results && !isAnalyzing && (
                    <div className="card">
                        <h2 className="section-title"><i className="fas fa-notes-medical" style={{color: 'var(--primary)'}}></i> Diagnosis Results</h2>
                        {results.length > 0 ? (
                            <>
                                {results.slice(0, 3).map((match, index) => (
                                    <div key={index} className="result-item">
                                        <div className="result-item-header">
                                            <span className="disease-name">{match.name}</span>
                                            <span className="match-badge">{match.percentage}% Match</span>
                                        </div>
                                        <div className="match-details">
                                            Matched <strong>{match.matchCount}</strong> out of <strong>{match.totalSymptoms}</strong> typical symptoms.
                                        </div>
                                        
                                        <div className="treatment-section">
                                            <div className="treatment-title precautions">
                                                <i className="fas fa-shield-alt"></i> Precautions & Home Care
                                            </div>
                                            <ul className="treatment-list">
                                                {match.precautions.map((precaution, idx) => (
                                                    <li key={idx}>{precaution}</li>
                                                ))}
                                            </ul>

                                            <div className="treatment-title drugs">
                                                <i className="fas fa-pills"></i> Common Drug Composition
                                            </div>
                                            <ul className="treatment-list">
                                                {match.drugs.map((drug, idx) => (
                                                    <li key={idx}>{drug}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                                <div className="disclaimer">
                                    <strong><i className="fas fa-exclamation-triangle"></i> MEDICAL DISCLAIMER:</strong><br />
                                    This tool is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always consult a healthcare provider for an accurate diagnosis and before taking any medications.
                                </div>
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem 0' }}>
                                No matching conditions found in our database for these symptoms.
                            </p>
                        )}
                        
                        <button className="reset-btn" onClick={resetAnalyzer}>
                            <i className="fas fa-redo"></i> Start Over
                        </button>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}