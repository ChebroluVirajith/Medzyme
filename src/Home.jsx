import React from 'react';
import './Home.css';
import AnimatedFeatureSection from './AnimatedFeatureSection'; // assuming AnimatedFeatureSection is a separate component

const Home = () => {
  return (
    <div className="home">
      {/* Existing feature cards here */}

      {/* New Animated Feature Sections */}
      <AnimatedFeatureSection
        title="AI Diagnosis"
        description="Leverage cutting-edge artificial intelligence to receive accurate diagnoses based on your symptoms and medical history. Our AI system is designed to assist healthcare professionals in providing timely and precise care."
        animationType="fadeIn"  // assuming you have different animation types
      />
      <AnimatedFeatureSection
        title="Virtual Consultations"
        description="Experience seamless healthcare from the comfort of your home. Our virtual consultation feature allows you to connect with healthcare providers through video calls, ensuring you receive personalized care whenever you need it."
        animationType="slideIn"  // assuming another animation type
      />
    </div>
  );
};

export default Home;