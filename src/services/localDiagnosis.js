const LOCAL_CONDITIONS = [
    {
        name: 'Common Cold',
        category: 'Respiratory',
        severity: 'mild',
        symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'mild fever', 'fatigue'],
        remedies: ['Rest well', 'Drink warm fluids', 'Use saline gargles'],
        drugs: [
            { name: 'Paracetamol', type: 'OTC', purpose: 'Fever and pain relief' },
            { name: 'Cetirizine', type: 'OTC', purpose: 'Runny nose and sneezing relief' }
        ]
    },
    {
        name: 'Influenza',
        category: 'Respiratory',
        severity: 'moderate',
        symptoms: ['high fever', 'chills', 'dry cough', 'body ache', 'headache', 'fatigue'],
        remedies: ['Hydrate frequently', 'Rest', 'Track fever every few hours'],
        drugs: [
            { name: 'Paracetamol', type: 'OTC', purpose: 'Fever and body ache relief' }
        ]
    },
    {
        name: 'COVID-19',
        category: 'Respiratory',
        severity: 'moderate',
        symptoms: ['fever', 'dry cough', 'fatigue', 'loss of smell', 'sore throat', 'shortness of breath'],
        remedies: ['Isolate', 'Hydrate', 'Monitor breathing and oxygen if available'],
        drugs: [
            { name: 'Paracetamol', type: 'OTC', purpose: 'Fever and pain relief' }
        ]
    },
    {
        name: 'Acute Gastroenteritis',
        category: 'Gastrointestinal',
        severity: 'moderate',
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'weakness'],
        remedies: ['Use oral rehydration salts', 'Small frequent fluids', 'Bland diet'],
        drugs: [
            { name: 'ORS', type: 'OTC', purpose: 'Hydration support' },
            { name: 'Probiotic', type: 'OTC', purpose: 'Gut recovery support' }
        ]
    },
    {
        name: 'Allergic Rhinitis',
        category: 'Allergy',
        severity: 'mild',
        symptoms: ['sneezing', 'runny nose', 'itching', 'nasal congestion', 'itchy eyes'],
        remedies: ['Avoid allergens', 'Use saline rinse', 'Keep room dust-free'],
        drugs: [
            { name: 'Loratadine', type: 'OTC', purpose: 'Allergy symptom relief' },
            { name: 'Fluticasone nasal spray', type: 'OTC', purpose: 'Nasal inflammation control' }
        ]
    },
    {
        name: 'Urinary Tract Infection',
        category: 'Urinary',
        severity: 'moderate',
        symptoms: ['burning urination', 'frequent urination', 'lower abdominal pain', 'cloudy urine'],
        remedies: ['Increase water intake', 'Do not hold urine', 'Seek urine test confirmation'],
        drugs: [
            { name: 'Urinary alkalizer', type: 'OTC', purpose: 'Burning relief (supportive)' }
        ]
    }
];

const EMERGENCY_WORDS = [
    'chest pain',
    'severe shortness of breath',
    'difficulty breathing',
    'fainting',
    'seizure',
    'confusion',
    'vomiting blood'
];

function normalize(input = '') {
    return String(input)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function includesPhrase(haystack, needle) {
    const h = normalize(haystack);
    const n = normalize(needle);

    if (!h || !n) return false;
    return h.includes(n);
}

function scoreCondition(text, condition) {
    const matchedSymptoms = condition.symptoms.filter((symptom) => includesPhrase(text, symptom));
    const score = matchedSymptoms.length;

    return {
        condition,
        matchedSymptoms,
        score,
        confidence: Math.min(95, Math.max(22, score * 18 + 25))
    };
}

function getTriage(text, bestMatch) {
    const emergencyHit = EMERGENCY_WORDS.find((word) => includesPhrase(text, word));

    if (emergencyHit) {
        return {
            level: 'emergency',
            urgent: true,
            reason: `Red-flag symptom detected: ${emergencyHit}. Seek emergency care immediately.`
        };
    }

    if (!bestMatch) {
        return {
            level: 'routine',
            urgent: false,
            reason: 'Need more symptom detail for accurate triage.'
        };
    }

    if (bestMatch.condition.severity === 'moderate') {
        return {
            level: 'soon',
            urgent: false,
            reason: 'Consult a clinician within 24 hours if symptoms continue.'
        };
    }

    return {
        level: 'routine',
        urgent: false,
        reason: 'Symptoms look mild now. Continue home care and monitor.'
    };
}

export function getLocalDiagnosisResponse({ message = '', history = [], imageName = '' }) {
    const historyText = Array.isArray(history)
        ? history
              .filter((entry) => entry?.role === 'user')
              .map((entry) => entry?.content || '')
              .join(' ')
        : '';

    const text = normalize(`${historyText} ${message} ${imageName}`);
    const ranked = LOCAL_CONDITIONS
        .map((condition) => scoreCondition(text, condition))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const best = ranked[0] || null;
    const triage = getTriage(text, best);

    const diagnosis = ranked.map((entry) => ({
        name: entry.condition.name,
        category: entry.condition.category,
        confidence: entry.confidence,
        severity: entry.condition.severity,
        description: `${entry.condition.name} pattern based on symptom overlap.`,
        evidenceSymptoms: entry.matchedSymptoms,
        redFlags: []
    }));

    const remedies = best ? best.condition.remedies.slice(0, 5) : [];
    const drugs = best ? best.condition.drugs.slice(0, 5) : [];

    let reply = 'Offline local diagnosis mode was used because backend was unreachable.\n\n';

    if (!diagnosis.length) {
        reply += 'I need more details: duration, fever level, pain location, and symptom progression.';
    } else {
        reply += 'Most likely conditions:\n';
        diagnosis.forEach((item, index) => {
            reply += `${index + 1}. ${item.name} (${item.confidence}% match)\n`;
        });

        if (remedies.length) {
            reply += '\nHome remedies:\n';
            remedies.forEach((item, index) => {
                reply += `${index + 1}. ${item}\n`;
            });
        }

        if (drugs.length) {
            reply += '\nMedicines to discuss with a clinician/pharmacist:\n';
            drugs.forEach((item, index) => {
                reply += `${index + 1}. ${item.name} [${item.type}] - ${item.purpose}\n`;
            });
        }
    }

    reply += `\nTriage: ${triage.level.toUpperCase()} - ${triage.reason}`;
    reply += '\nThis is educational triage support only, not a confirmed diagnosis.';

    return {
        reply,
        diagnosis,
        remedies,
        drugs,
        followUpQuestions: [
            'How long have symptoms been present?',
            'Are symptoms improving or worsening?',
            'Do you have fever, chest pain, or breathing difficulty?'
        ],
        triage,
        imageInsights: imageName
            ? {
                  source: 'offline-filename-hint',
                  note: 'Image was provided; offline mode only used filename context.',
                  visibleFindings: [imageName]
              }
            : null,
        dataset: {
            name: 'Local Frontend Fallback Dataset',
            updatedOn: '2026-03-11'
        },
        disclaimer:
            'Offline fallback was used. This is educational support and not a confirmed medical diagnosis.'
    };
}
