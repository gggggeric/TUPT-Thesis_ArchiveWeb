import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Register.css';
import API_BASE_URL from '../../api'; // Import API base URL

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'idNumber') {
      let formattedValue = value.replace(/[^a-zA-Z0-9]/g, '');
      formattedValue = formattedValue.toUpperCase();
      
      if (!formattedValue.startsWith('TUPT') && formattedValue.length > 0) {
        formattedValue = 'TUPT' + formattedValue;
      }
      
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
      }
      if (formattedValue.length > 7) {
        formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7, 11);
      }
      formattedValue = formattedValue.slice(0, 12);
      
      value = formattedValue;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'password') {
      checkPasswordStrength(value);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 8) {
      setPasswordStrength('medium');
    } else {
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      setPasswordStrength(strongRegex.test(password) ? 'strong' : 'medium');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return 'transparent';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  };

  const validateIDNumber = (idNumber) => {
    const idRegex = /^TUPT-\d{2}-\d{4}$/;
    return idRegex.test(idNumber);
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegister = async () => {
    const { fullName, idNumber, birthdate, password, confirmPassword } = formData;

    if (!fullName || !idNumber || !birthdate || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateIDNumber(idNumber)) {
      toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
      return;
    }

    const age = calculateAge(birthdate);
    if (age < 16) {
      toast.error('You must be at least 16 years old to register');
      return;
    }

    if (age > 100) {
      toast.error('Please enter a valid birthdate');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          idNumber: idNumber,
          birthdate: birthdate,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Account created successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      idNumber: '',
      birthdate: '',
      password: '',
      confirmPassword: '',
    });
    setPasswordStrength('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="register-gradient-background">
      <div className="register-container">
        <div className="register-scroll-container">
          <div className="register-section">
            {/* Header Section */}
            <div className="register-header-section">
              <div className="register-logo-container">
                <span className="register-person-icon">👤</span>
              </div>
              <h1 className="register-welcome-title">Create Account</h1>
              <p className="register-welcome-subtitle">Join our research community</p>
            </div>

            {/* Register Card */}
            <div className="register-box">
              {/* Full Name Input */}
              <div className="register-input-container">
                <label className="register-label">Full Name</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon">👤</span>
                  <input
                    type="text"
                    className="register-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              {/* ID Number Input */}
              <div className="register-input-container">
                <label className="register-label">ID Number</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon">🎫</span>
                  <input
                    type="text"
                    className="register-input"
                    placeholder="TUPT-XX-XXXX"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={12}
                  />
                </div>
                <p className="register-hint-text">Format: TUPT-XX-XXXX</p>
              </div>

              {/* Birthdate Input */}
              <div className="register-input-container">
                <label className="register-label">Birthdate</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon">📅</span>
                  <input
                    type="date"
                    className="register-input"
                    value={formData.birthdate}
                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                  />
                </div>
                {formData.birthdate && (
                  <p className="register-date-display">
                    Selected: {formatDisplayDate(formData.birthdate)}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="register-input-container">
                <label className="register-label">Password</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="register-input register-password-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="register-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                
                {passwordStrength && (
                  <div className="register-password-strength-container">
                    <div className="register-strength-bar-container">
                      <div 
                        className="register-password-strength"
                        style={{
                          backgroundColor: getPasswordStrengthColor(),
                          width: getPasswordStrengthWidth(),
                        }}
                      />
                    </div>
                    <span 
                      className="register-strength-text"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="register-input-container">
                <label className="register-label">Confirm Password</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="register-input register-password-input"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="register-eye-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="register-buttons">
                <button 
                  className={`register-btn-clear ${isLoading ? 'register-disabled-button' : ''}`}
                  onClick={handleClear}
                  disabled={isLoading}
                  type="button"
                >
                  <span className="register-clear-icon">❌</span>
                  <span className="register-clear-button-text">Clear</span>
                </button>
                
                <button 
                  className={`register-btn-register ${isLoading ? 'register-disabled-button' : ''}`}
                  onClick={handleRegister}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <span className="register-button-text">Creating...</span>
                  ) : (
                    <>
                      <span className="register-button-text">Register</span>
                      <span className="register-arrow-icon">→</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="register-signin-container">
                <span className="register-signin-text">Already have an account? </span>
                <Link to="/login" className="register-signin-link">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;