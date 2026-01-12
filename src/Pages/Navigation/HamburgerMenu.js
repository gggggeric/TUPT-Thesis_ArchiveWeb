import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaBook,
  FaCog,
  FaQuestionCircle,
  FaUser,
  FaEdit,
  FaInfoCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaChevronRight
} from 'react-icons/fa';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage when menu becomes visible
  useEffect(() => {
    if (isVisible) {
      loadUserData();
    }
  }, [isVisible]);

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/dashboard' },
    { icon: FaFileAlt, label: 'My Documents', path: '/documents' },

  ];

  const handleMenuItemPress = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      // Get user name before removing data for the toast message
      const userName = user?.name || 'User';
      
      localStorage.removeItem('userData');
      setUser(null);
      onClose();
      
      // Show success toast
      toast.success(`Goodbye, ${userName}! You have been logged out successfully.`);
      
      console.log('User logged out successfully');
      
      // Navigate to login after a short delay to show the toast
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('There was an error logging out. Please try again.');
    }
  };

  const handleProfileClick = () => {
    onClose();
    navigate('/profile');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="hamburger-overlay" onClick={onClose} />
      
      {/* Menu */}
      <div className="hamburger-menu">
        <div className="menu-gradient">
          {/* Header Section with Red Gradient */}
          <div className="menu-header-section">
            {/* User Profile Section */}
            <div 
              className="user-section"
              onClick={handleProfileClick}
            >
              <div className="user-avatar-container">
                <div className="user-avatar">
                  <FaUser className="user-avatar-icon" />
                </div>
                <div className="edit-icon-container">
                  <FaEdit className="edit-icon" />
                </div>
              </div>
              <div className="user-name">
                {user?.name || 'Guest User'}
              </div>
              <div className="user-info-badge">
                <span className="user-id">
                  {user?.idNumber || 'TUPT-00-0000'}
                </span>
              </div>
              {user?.age && (
                <div className="user-age">
                  Age: {user.age}
                </div>
              )}
              <div className="view-profile-hint">
                Tap to view profile
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu-items-container">
            <div className="menu-items">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    className="menu-item"
                    onClick={() => handleMenuItemPress(item.path)}
                  >
                    <div className="menu-item-content">
                      <div className="menu-icon-container">
                        <IconComponent className="menu-icon" />
                      </div>
                      <span className="menu-item-text">{item.label}</span>
                    </div>
                    <FaChevronRight className="menu-arrow" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="menu-bottom-section">
            {/* App Version */}
            <div className="version-container">
              <FaInfoCircle className="version-icon" />
              <span className="version-text">Version 1.0.0</span>
            </div>

            {/* Logout Button - Only show if user is logged in */}
            {user && (
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="logout-icon" />
                <span className="logout-text">Logout</span>
              </button>
            )}

            {/* Login Button - Show if user is not logged in */}
            {!user && (
              <button 
                className="login-button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
              >
                <FaSignInAlt className="login-icon" />
                <span className="login-text">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;