import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaIdCard, 
  FaTimes, 
  FaArrowRight,
  FaSignInAlt 
} from 'react-icons/fa';
import './Login.css';
import tupLogo from '../../assets/tup-logo.png';
import API_BASE_URL from '../../api';

const Login = () => {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (value) => {
    // Format ID number as user types
    let formattedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    
    // Convert to uppercase
    formattedValue = formattedValue.toUpperCase();
    
    // Add TUPT- prefix if not present
    if (!formattedValue.startsWith('TUPT') && formattedValue.length > 0) {
      formattedValue = 'TUPT' + formattedValue;
    }
    
    // Format as TUPT-XX-XXXX
    if (formattedValue.length > 4) {
      formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
    }
    if (formattedValue.length > 7) {
      formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7, 11);
    }
    // Limit total length to 12 characters (TUPT-XX-XXXX)
    formattedValue = formattedValue.slice(0, 12);
    
    setIdNumber(formattedValue);
  };

  const validateIDNumber = (idNumber) => {
    // Validate format: TUPT-XX-XXXX
    const idRegex = /^TUPT-\d{2}-\d{4}$/;
    return idRegex.test(idNumber);
  };

  const handleLogin = async () => {
    if (!idNumber || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateIDNumber(idNumber)) {
      toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idNumber: idNumber,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        const userData = {
          _id: data.user._id,
          name: data.user.name,
          idNumber: data.user.idNumber,
          birthdate: data.user.birthdate,
          age: data.user.age,
          createdAt: data.user.createdAt,
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        toast.success(data.message || 'Logged in successfully!');
        console.log('User data stored:', userData);
        navigate('/home');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setIdNumber('');
    setPassword('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-gradient-background">
      <div className="login-container">
        <div className="login-scroll-container">
          <div className="login-section">
            {/* Logo/Header Section */}
            <div className="login-header-section">
              <div className="login-logo-container">
                <img 
                  src={tupLogo}
                  alt="TUP Logo"
                  className="login-logo-image"
                />
              </div>
              <h1 className="login-welcome-title">TUPT-Thesis Archive</h1>
              <p className="login-welcome-subtitle">Sign in</p>
            </div>

            {/* Login Card */}
            <div className="login-box">
              {/* ID Number Input */}
              <div className="login-input-container">
                <label className="login-label">ID Number</label>
                <div className="login-input-wrapper">
                  <FaIdCard className="login-input-icon" />
                  <input
                    type="text"
                    className="login-input"
                    placeholder="TUPT-XX-XXXX"
                    value={idNumber}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={12}
                  />
                </div>
                <p className="login-hint-text">Format: TUPT-XX-XXXX</p>
              </div>

              {/* Password Input */}
              <div className="login-input-container">
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <FaLock className="login-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input login-password-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="login-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <button className="login-forgot-password">
                Forgot Password?
              </button>

              {/* Buttons */}
              <div className="login-buttons">
                <button 
                  className={`login-btn-clear ${isLoading ? 'login-disabled-button' : ''}`}
                  onClick={handleClear}
                  disabled={isLoading}
                  type="button"
                >
                  <FaTimes className="login-clear-icon" />
                  <span className="login-clear-button-text">Clear</span>
                </button>
                
                <button 
                  className={`login-btn-login ${isLoading ? 'login-disabled-button' : ''}`}
                  onClick={handleLogin}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <span className="login-button-text">Logging in...</span>
                  ) : (
                    <>
                      <span className="login-button-text">Login</span>
                      <FaArrowRight className="login-arrow-icon" />
                    </>
                  )}
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="login-signup-container">
                <span className="login-signup-text">Don't have an account? </span>
                <Link to="/register" className="login-signup-link">
                  <FaSignInAlt style={{ marginRight: '8px' }} />
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;