import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

// SVG Graphic Components
const HeartbeatSVG = () => (
    <svg className="graphic-svg heartbeat" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 50 L40 50 L50 30 L60 70 L80 10 L100 80 L120 40 L190 50" 
              stroke="#100c5f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="50" cy="30" r="3" fill="#100c5f"/>
        <circle cx="80" cy="10" r="3" fill="#100c5f"/>
        <circle cx="100" cy="80" r="3" fill="#100c5f"/>
    </svg>
);

const MedicineBottleSVG = () => (
    <svg className="graphic-svg medicine-bottle" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 20 L35 15 Q35 10 40 10 L60 10 Q65 10 65 15 L65 20" 
              fill="none" stroke="#100c5f" strokeWidth="2"/>
        <rect x="35" y="20" width="30" height="80" rx="5" fill="none" stroke="#100c5f" strokeWidth="2"/>
        <rect x="35" y="50" width="30" height="30" fill="#100c5f" opacity="0.4"/>
        <circle cx="50" cy="75" r="3" fill="#100c5f"/>
        <path d="M25 100 L75 100" stroke="#100c5f" strokeWidth="2"/>
        <rect x="35" y="100" width="30" height="15" rx="2" fill="none" stroke="#100c5f" strokeWidth="2"/>
    </svg>
);

const ShieldSVG = () => (
    <svg className="graphic-svg shield" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 L80 25 L80 60 Q80 90 50 110 Q20 90 20 60 L20 25 Z" 
              fill="none" stroke="#100c5f" strokeWidth="2.5"/>
        <path d="M40 60 L48 68 L60 50" fill="none" stroke="#100c5f" strokeWidth="2.5" 
              strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const VideoCamSVG = () => (
    <svg className="graphic-svg video-cam" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="80" height="60" rx="5" fill="none" stroke="#100c5f" strokeWidth="2"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#100c5f" strokeWidth="2"/>
        <polygon points="140,30 140,70 110,50" fill="#100c5f"/>
    </svg>
);

const StethoscopeSVG = () => (
    <svg className="graphic-svg stethoscope" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 10 Q40 10 35 25 Q30 35 35 45 L30 60 Q30 70 40 75 L50 80" 
              fill="none" stroke="#100c5f" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M60 10 Q80 10 85 25 Q90 35 85 45 L90 60 Q90 70 80 75 L70 80" 
              fill="none" stroke="#100c5f" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="50" cy="95" r="8" fill="none" stroke="#100c5f" strokeWidth="2.5"/>
        <circle cx="70" cy="95" r="8" fill="none" stroke="#100c5f" strokeWidth="2.5"/>
        <line x1="60" y1="80" x2="60" y2="90" stroke="#100c5f" strokeWidth="2"/>
    </svg>
);

const ClockSVG = () => (
    <svg className="graphic-svg clock" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#100c5f" strokeWidth="2.5"/>
        <circle cx="60" cy="60" r="4" fill="#100c5f"/>
        <line x1="60" y1="60" x2="60" y2="25" stroke="#100c5f" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="60" y1="60" x2="85" y2="60" stroke="#100c5f" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="60" cy="15" r="3" fill="#100c5f"/>
        <circle cx="60" cy="105" r="3" fill="#100c5f"/>
        <circle cx="15" cy="60" r="3" fill="#100c5f"/>
        <circle cx="105" cy="60" r="3" fill="#100c5f"/>
    </svg>
);

const ChartSVG = () => (
    <svg className="graphic-svg chart" viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="100" x2="130" y2="100" stroke="#100c5f" strokeWidth="2"/>
        <line x1="20" y1="100" x2="20" y2="20" stroke="#100c5f" strokeWidth="2"/>
        <rect x="40" y="70" width="15" height="30" fill="#100c5f" opacity="0.6"/>
        <rect x="65" y="45" width="15" height="55" fill="#100c5f" opacity="0.8"/>
        <rect x="90" y="30" width="15" height="70" fill="#100c5f"/>
        <circle cx="48" cy="70" r="3" fill="#100c5f"/>
        <circle cx="73" cy="45" r="3" fill="#100c5f"/>
        <circle cx="98" cy="30" r="3" fill="#100c5f"/>
    </svg>
);

const BubbleGroup = ({ count = 5 }) => {
    const bubbles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 40 + 20,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 3,
    }));

    return (
        <div className="bubble-group">
            {bubbles.map(bubble => (
                <div
                    key={bubble.id}
                    className="bubble"
                    style={{
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        animationDelay: `${bubble.delay}s`,
                        animationDuration: `${bubble.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Animated Number Component
const StatCard = ({ endValue, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(endValue);
        if (isNaN(end)) return;
        
        const duration = 2000;
        const increment = end / (duration / 50);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 50);

        return () => clearInterval(timer);
    }, [endValue]);

    return (
        <div className="stat-card card visible animated fadeInUp">
            <div className="number">{count}{suffix}</div>
            <div className="label">{label}</div>
        </div>
    );
};

// Enhanced Feature Card Component
const FeatureCardEnhanced = ({ icon, title, description, link, graphic, svgGraphic }) => {
    return (
        <a href={link} className="feature-card card animated fadeInUp hover-lift">
            <div className="feature-icon-container">
                {svgGraphic ? (
                    svgGraphic
                ) : (
                    <>
                        <i className={`fas ${icon}`}></i>
                        {graphic && <div className="graphic-element">{graphic}</div>}
                    </>
                )}
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
            <div className="feature-footer">
                <span className="learn-more">Learn More →</span>
            </div>
        </a>
    );
};

// Why Choose Card Component
const WhyChooseCard = ({ icon, title, description, benefit }) => {
    return (
        <div className="why-choose-card animated fadeInUp">
            <div className="icon-wrapper">
                <span className="icon-emoji">{icon}</span>
            </div>
            <div className="content-wrapper">
                <h4 className="card-title">{title}</h4>
                <p className="card-description">{description}</p>
                <p className="card-benefit">
                    <span className="benefit-icon">→</span> {benefit}
                </p>
            </div>
        </div>
    );
};

export default function Home() {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowToast(true), 1500);
        const timer2 = setTimeout(() => setShowToast(false), 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <>
            <Header />
            <main className="container">
                {/* Hero Section with Graphics */}
                <div className="hero animated fadeIn">
                    <BubbleGroup count={6} />
                    <div className="hero-content">
                        <div className="hero-graphics">
                            <div className="graphic-float graphic-1">
                                <ShieldSVG />
                            </div>
                            <div className="graphic-float graphic-2">
                                <HeartbeatSVG />
                            </div>
                        </div>
                        <h1 className="hero-title">AI-Powered Healthcare at Your Fingertips</h1>
                        <p className="hero-subtitle">Get instant medical assistance, track your health, and connect with healthcare professionals</p>
                        <a href="/signup" className="btn btn-primary btn-pulse">Get Started</a>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="stats">
                    <StatCard endValue="10000" label="Active Users" />
                    <StatCard endValue="98" suffix="%" label="Satisfaction Rate" />
                    <StatCard endValue="24/7" label="Support" />
                    <StatCard endValue="5000" label="AI Diagnoses" />
                </div>

                {/* Feature Cards with SVG Graphics */}
                <div className="grid">
                    <FeatureCardEnhanced
                        title="AI Diagnosis"
                        description="Get instant AI-powered preliminary diagnosis based on your symptoms. Our advanced algorithms analyze your health information."
                        link="/diagnosis"
                        svgGraphic={<StethoscopeSVG />}
                    />
                    <FeatureCardEnhanced
                        title="Virtual Consultations"
                        description="Connect with healthcare professionals through secure video calls. Experience convenient medical consultations anytime."
                        link="/telemedicine"
                        svgGraphic={<VideoCamSVG />}
                    />
                    <FeatureCardEnhanced
                        title="Medicine Tracker"
                        description="Never miss a dose again. Keep track of medications with smart reminders and maintain prescription history."
                        link="/medicine_tracker"
                        svgGraphic={<MedicineBottleSVG />}
                    />
                    <FeatureCardEnhanced
                        title="Health Profile"
                        description="Manage your complete health profile in one place. Store vital information and medical history for quick access."
                        link="/profile"
                        svgGraphic={<ShieldSVG />}
                    />
                </div>

                {/* Why Choose Medzyme Section */}
                <section className="why-choose-section animated fadeInUp">
                    <div className="why-choose-header">
                        <h2>Why Choose Medzyme?</h2>
                        <p className="section-subtitle">Experience the future of healthcare with our comprehensive platform</p>
                        <div className="header-decoration"></div>
                    </div>

                    <div className="why-choose-cards-container">
                        <WhyChooseCard
                            icon="🛡️"
                            title="Secure & Private"
                            description="Your health data is encrypted and protected with industry-leading security standards"
                            benefit="HIPAA compliant & fully encrypted"
                        />
                        <WhyChooseCard
                            icon="⚡"
                            title="Fast & Reliable"
                            description="Get instant diagnoses and connect with doctors in seconds, not hours"
                            benefit="Average response time: 30 seconds"
                        />
                        <WhyChooseCard
                            icon="🌍"
                            title="Available 24/7"
                            description="Access healthcare services anytime, anywhere, on any device"
                            benefit="Always-on healthcare support"
                        />
                        <WhyChooseCard
                            icon="💚"
                            title="Care You Trust"
                            description="Connected with certified healthcare professionals dedicated to your wellbeing"
                            benefit="Verified & certified doctors"
                        />
                    </div>

                    {/* Benefits Text Block with Graphic */}
                    <div className="benefits-text-block animated slideInUp">
                        <div className="benefits-content">
                            <div className="benefits-graphic">
                                <ClockSVG />
                            </div>
                            <h3>What Makes Us Different</h3>
                            <p>
                                Medzyme combines cutting-edge AI technology with human expertise to create a unique healthcare 
                                experience. We understand that modern patients need quick, accessible, and reliable medical solutions.
                            </p>
                            <ul className="benefits-list">
                                <li>✓ Personalized health recommendations</li>
                                <li>✓ AI-powered symptom analysis</li>
                                <li>✓ Direct access to professionals</li>
                                <li>✓ Complete medical history tracking</li>
                                <li>✓ Prescription management</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Impact Section with Chart */}
                <section className="impact-section animated fadeInUp">
                    <h2>Our Impact</h2>
                    <div className="impact-content">
                        <div className="impact-text">
                            <p className="impact-intro">
                                Since our launch, Medzyme has revolutionized the way people access healthcare.
                            </p>
                            <ul className="impact-list">
                                <li>✓ Average diagnosis time: 5 minutes</li>
                                <li>✓ Doctor response time: under 30 minutes</li>
                                <li>✓ 98% patient satisfaction rate</li>
                                <li>✓ Available in multiple languages</li>
                                <li>✓ Serving patients in 50+ countries</li>
                            </ul>
                        </div>
                        <div className="impact-graphic">
                            <ChartSVG />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works animated fadeInUp">
                    <h2>How Medzyme Works</h2>
                    <div className="steps-container">
                        <div className="step-card animated slideInLeft">
                            <div className="step-number">1</div>
                            <div className="step-graphic"><ShieldSVG /></div>
                            <h4>Create Your Profile</h4>
                            <p>Sign up and enter your health information</p>
                        </div>
                        <div className="step-card animated slideInUp" style={{ animationDelay: '0.1s' }}>
                            <div className="step-number">2</div>
                            <div className="step-graphic"><StethoscopeSVG /></div>
                            <h4>Describe Symptoms</h4>
                            <p>Tell our AI about your symptoms</p>
                        </div>
                        <div className="step-card animated slideInRight" style={{ animationDelay: '0.2s' }}>
                            <div className="step-number">3</div>
                            <div className="step-graphic"><ChartSVG /></div>
                            <h4>Get Diagnosis</h4>
                            <p>Receive AI diagnosis instantly</p>
                        </div>
                        <div className="step-card animated slideInRight" style={{ animationDelay: '0.3s' }}>
                            <div className="step-number">4</div>
                            <div className="step-graphic"><VideoCamSVG /></div>
                            <h4>Consult Doctor</h4>
                            <p>Connect with healthcare professional</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section animated fadeInUp">
                    <div className="cta-content">
                        <h2>Ready to Take Control of Your Health?</h2>
                        <p>Join thousands of patients who trust Medzyme</p>
                        <div className="cta-buttons">
                            <a href="/signup" className="btn btn-primary btn-large animated pulse">Start Your Journey</a>
                            <a href="#contact" className="btn btn-outline btn-large">Contact Us</a>
                        </div>
                    </div>
                </section>
            </main>
            
            <BottomNav />

            {/* Toast Notification */}
            <div className={`toast ${showToast ? 'show' : ''}`} id="notification">
                Welcome to Medzyme! 🌟
            </div>
        </>
    );
}