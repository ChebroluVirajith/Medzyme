const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic test route
app.get("/", (req, res) => {
    res.send("Welcome to Medzyme API! 🚀");
});

const nodemailer = require("nodemailer");

// Email notification endpoint for missed medicines
app.post("/api/notify", async (req, res) => {
    const { email, name, medicine, time } = req.body;

    if (!email || !medicine) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // --------------------------------------------------------------------------
        // ⚠️ IMPORTANT: To make this send real emails to your Gmail account:
        // 1. You must replace 'YOUR_GMAIL@gmail.com' with your actual Gmail address.
        // 2. You must replace 'YOUR_APP_PASSWORD' with a 16-character Google App Password.
        //    (You can create one by going to Google Account -> Security -> 2-Step Verification -> App Passwords)
        // --------------------------------------------------------------------------
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'virajithch4@gmail.com', // <-- CHANGE THIS
                pass: 'YOUR_APP_PASSWORD'     // <-- CHANGE THIS
            }
        });

        const mailOptions = {
            from: '"Medzyme Alerts" <no-reply@medzyme.com>',
            to: email, // This sends it to whatever email the user logged in with!
            subject: `🚨 Medzyme Alert: Time to take your ${medicine}!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Medication Reminder</h2>
                    <p style="font-size: 16px; color: #374151;">Hello ${name || 'User'},</p>
                    <p style="font-size: 16px; color: #374151;">
                        You have a scheduled medicine that you haven't marked as taken yet!
                    </p>
                    <div style="background: #fef08a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #854d0e;">${medicine}</span><br/>
                        <span style="font-size: 14px; color: #a16207;">Scheduled for: ${time}</span>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">Please log into Medzyme and mark it as taken once you consume it.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📨 Email sent:", info.messageId);

        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// Diagnosis API endpoint
app.post("/api/diagnosis/chat", (req, res) => {
    const { message, history, image } = req.body;

    let mockDiagnosis;
    const lowerMessage = (message || "").toLowerCase();
    const isWound = lowerMessage.includes('wound') || lowerMessage.includes('bruise') || lowerMessage.includes('cut') || lowerMessage.includes('scrape') || lowerMessage.includes('blood');

    if (isWound || (image && image.name && (image.name.toLowerCase().includes('wound') || image.name.toLowerCase().includes('bruise')))) {
        mockDiagnosis = {
            reply: "I have analyzed your input and image. The presentation indicates physical trauma resulting in a wound or bruise. Please ensure it is kept clean and monitor for infection.",
            diagnosis: [
                {
                    name: "Physical Trauma (Wound/Bruise)",
                    category: "Trauma/Dermatological",
                    confidence: 90,
                    severity: "moderate",
                    description: "A physical injury to the skin or underlying tissue, presenting as a scratch, cut, or contusion (bruise).",
                    evidenceSymptoms: ["visible skin break", "discoloration", "bleeding or bruising"],
                    redFlags: ["deep cut requiring stitches", "uncontrollable bleeding", "signs of infection (pus, extreme heat)"]
                }
            ],
            remedies: [
                "Clean the wound thoroughly with mild soap and water or saline",
                "Apply pressure to stop any bleeding",
                "Apply an ice pack wrapped in a cloth for bruises to reduce swelling",
                "Keep the wound covered with a sterile bandage"
            ],
            drugs: [
                {
                    name: "Antibiotic Ointment (Neosporin)",
                    type: "Topical",
                    purpose: "Prevents bacterial infection in cuts and scrapes"
                },
                {
                    name: "Ibuprofen or Acetaminophen",
                    type: "OTC Pain Reliever",
                    purpose: "Reduces pain and swelling associated with the injury"
                }
            ],
            diet: [
                "High protein foods (eggs, lean meat) for tissue repair",
                "Vitamin C rich fruits (oranges, berries) for collagen production",
                "Stay well hydrated to improve blood flow"
            ],
            followUpQuestions: [
                "Is the bleeding stopping with direct pressure?",
                "Is the area becoming increasingly red, warm, or swollen?",
                "When was your last Tetanus shot?"
            ],
            triage: {
                level: "soon",
                urgent: false,
                reason: "Monitor the wound. If bleeding doesn't stop, it is deep, or shows signs of infection, seek emergency medical attention."
            }
        };
    } else if (image) {
        mockDiagnosis = {
            reply: "I have analyzed the uploaded image. The visual presentation indicates a type of skin rash, highly consistent with Contact Dermatitis or Eczema. Please consult a dermatologist for confirmation.",
            diagnosis: [
                {
                    name: "Contact Dermatitis (Skin Rash)",
                    category: "Dermatological",
                    confidence: 88,
                    severity: "moderate",
                    description: "An itchy, red rash caused by direct contact with a substance or an allergic reaction to it.",
                    evidenceSymptoms: ["redness", "inflammation", "visible surface irritation from image"],
                    redFlags: ["swelling of face", "difficulty breathing"]
                }
            ],
            remedies: [
                "Apply a cold, wet compress to the affected area",
                "Take cool baths with baking soda or oatmeal",
                "Avoid scratching the rash",
                "Avoid contact with known allergens or harsh soaps"
            ],
            drugs: [
                {
                    name: "Hydrocortisone Cream (1%)",
                    type: "Topical Steroid",
                    purpose: "Reduces inflammation, redness, and itching"
                },
                {
                    name: "Diphenhydramine (Benadryl)",
                    type: "Oral Antihistamine",
                    purpose: "Helps relieve severe itching and allergic response"
                },
                {
                    name: "Calamine Lotion",
                    type: "Topical",
                    purpose: "Soothes skin and relieves mild itching"
                }
            ],
            diet: [
                "Anti-inflammatory foods (fatty fish, olive oil, leafy greens)",
                "Foods rich in probiotics (yogurt, kefir) for gut health",
                "Avoid spicy foods, highly processed foods, and known food allergens"
            ],
            followUpQuestions: [
                "Is the rash spreading to other parts of your body?",
                "Have you recently changed your laundry detergent or soap?",
                "Is the rash painful or warm to the touch?"
            ],
            triage: {
                level: "routine",
                urgent: false,
                reason: "Rash appears localized and non-life-threatening. Use topical treatments and monitor for spreading."
            }
        };
    } else {
        // Default text-only response
        mockDiagnosis = {
            reply: "Based on your symptoms, this could be a common condition. Please consult with a healthcare professional for accurate diagnosis.",
            diagnosis: [
                {
                    name: "Common Cold",
                    category: "Respiratory",
                    confidence: 65,
                    severity: "mild",
                    description: "Common viral infection affecting upper respiratory tract",
                    evidenceSymptoms: ["symptoms mentioned in text"],
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
            diet: [
                "Warm clear broths and soups (like chicken noodle soup)",
                "Vitamin C rich citrus fruits (oranges, lemons)",
                "Warm honey and ginger tea to soothe throat",
                "Avoid heavy dairy if it thickens mucus"
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
    }

    res.json(mockDiagnosis);
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});