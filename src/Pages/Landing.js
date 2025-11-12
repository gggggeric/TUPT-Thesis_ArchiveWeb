import React from 'react';
import './Landing.css';
import tupLogo from '../assets/tup-logo.png'; 
const LandingPage = () => {
  const handleGetStarted = () => {
    // Navigate to register page
    window.location.href = '/register';
  };

  const handleSignIn = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  return (
    <div className="gradient-background">
      <div className="scroll-container">
        <div className="content">
          {/* Logo/Header Section */}
          <div className="header-section">
            <div className="logo-container">
              <img 
                src={tupLogo} // Fixed: using imported variable
                alt="TUP Logo"
                className="logo-image"
              />
            </div>
            <h1 className="welcome-title">TUPT-Thesis Archive</h1>
            <p className="welcome-subtitle">
              Get AI-powered recommendations to improve your thesis
            </p>
          </div>

          {/* Main Card */}
          <div className="login-box">
            {/* Feature List */}
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-container">
                  <span className="icon">📄</span>
                </div>
                <div className="feature-text-container">
                  <h3 className="feature-title">Analyze Thesis Content</h3>
                  <p className="feature-description">
                    Upload and analyze your thesis with advanced AI technology
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-container">
                  <span className="icon">💡</span>
                </div>
                <div className="feature-text-container">
                  <h3 className="feature-title">Get Recommendations</h3>
                  <p className="feature-description">
                    Receive personalized suggestions to improve your work
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-container">
                  <span className="icon">📊</span>
                </div>
                <div className="feature-text-container">
                  <h3 className="feature-title">Track Your Progress</h3>
                  <p className="feature-description">
                    Monitor improvements and achievements over time
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="button-container">
              <button 
                className="btn-primary"
                onClick={handleGetStarted}
              >
                <div className="primary-gradient">
                  <span className="primary-button-text">Get Started</span>
                  <span className="icon-arrow">→</span>
                </div>
              </button>

              <button 
                className="btn-secondary"
                onClick={handleSignIn}
              >
                <span className="icon-login">🔐</span>
                <span className="secondary-button-text">Sign In</span>
              </button>
            </div>

            {/* Footer Text */}
            <div className="footer-container">
              <span className="icon-shield">🛡️</span>
              <p className="footer-text">
                Secure and reliable thesis management system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;