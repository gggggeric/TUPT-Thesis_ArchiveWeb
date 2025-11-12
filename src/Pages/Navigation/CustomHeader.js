import React, { useState, useRef } from 'react';
import { 
  FaBars,
  FaSearch,
  FaTimes,
  FaBell
} from 'react-icons/fa';
import './CustomHeader.css';

const CustomHeader = ({ onMenuPress, onSearch, searchQuery, onSearchChange }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchContainerRef.current) {
      searchContainerRef.current.style.width = '250px';
    }
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchFocused(false);
      if (searchContainerRef.current) {
        searchContainerRef.current.style.width = '60px';
      }
    }
  };

  const clearSearch = () => {
    onSearchChange('');
    setIsSearchFocused(false);
    if (searchContainerRef.current) {
      searchContainerRef.current.style.width = '60px';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <header className="custom-header">
      {/* Menu Button */}
      <button 
        className="menu-button"
        onClick={onMenuPress}
      >
        <FaBars className="menu-icon" />
      </button>

      {/* Search Bar */}
      <div 
        ref={searchContainerRef}
        className={`search-container ${isSearchFocused || searchQuery ? 'search-focused' : ''}`}
      >
        {isSearchFocused || searchQuery ? (
          <input
            type="text"
            className="search-input"
            placeholder="Search theses, documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyPress={handleKeyPress}
            autoCapitalize="none"
            autoCorrect="off"
          />
        ) : (
          <button 
            className="search-placeholder"
            onClick={handleSearchFocus}
          >
            <FaSearch className="search-icon" />
          </button>
        )}

        {/* Clear Search Button */}
        {(isSearchFocused || searchQuery) && (
          <button 
            className="clear-button"
            onClick={clearSearch}
          >
            <FaTimes className="clear-icon" />
          </button>
        )}
      </div>

      {/* Notification Button */}
      <button className="notification-button">
        <FaBell className="notification-icon" />
      </button>
    </header>
  );
};

export default CustomHeader;