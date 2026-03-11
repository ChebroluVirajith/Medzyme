const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
    res.send("Welcome to Medzyme API! 🚀");
});

// Diagnosis API endpoint
app.post("/api/diagnosis/chat", (req, res) => {
    const { message, history, image } = req.body;

    // Mock diagnosis response
    const mockDiagnosis = {
        reply: "Based on your symptoms, this could be a common condition. Please consult with a healthcare professional for accurate diagnosis.",
        diagnosis: [
            {
                name: "Common Cold",
                category: "Respiratory",
                confidence: 65,
                severity: "mild",
                description: "Common viral infection affecting upper respiratory tract",
                evidenceSymptoms: ["symptoms mentioned"],
                redFlags: []
            }
        ],
        remedies: [
            "Rest well",
            "Stay hydrated",
            "Use saline gargles"
        ],
        drugs: [
            {
                name: "Paracetamol",
                type: "OTC",
                purpose: "Fever and pain relief"
            }
        ],
        followUpQuestions: [
            "How long have symptoms been present?",
            "Are symptoms improving or worsening?",
            "Do you have fever?"
        ],
        triage: {
            level: "routine",
            urgent: false,
            reason: "Symptoms appear mild. Continue monitoring and seek care if symptoms worsen."
        }
    };

    res.json(mockDiagnosis);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});