import React, { useState, useRef, useEffect } from 'react';
import { 
  FaBars,
  FaSearch,
  FaTimes,
  FaBell,
  FaChevronDown,
  FaFilter,
  FaFolder,
  FaCalendarAlt,
  FaFileAlt
} from 'react-icons/fa';
import './CustomHeader.css';

// Import your JSON data (adjust path as needed)
import thesisData from '../../data/trained_model.json';

const CustomHeader = ({ onMenuPress, onSearch, searchQuery, onSearchChange }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    folder: 'all',
    year: 'all',
    searchType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchContainerRef = useRef(null);
  const resultsRef = useRef(null);

  // Extract theses from your JSON
  const theses = thesisData.theses || [];

  // Get unique folders and years for filters
  const folders = ['all', ...new Set(theses.map(t => t.folder).filter(f => f && f !== 'unknown'))];
  const years = ['all', ...new Set(theses.map(t => t.year_range).filter(y => y && y !== 'unknown'))];

  // Handle search
  const performSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    let results = [];

    // Search through theses
    theses.forEach(thesis => {
      // Apply filters
      if (filters.folder !== 'all' && thesis.folder !== filters.folder) return;
      if (filters.year !== 'all' && thesis.year_range !== filters.year) return;

      let score = 0;
      const searchIn = filters.searchType;

      // Search in title
      if ((searchIn === 'all' || searchIn === 'title') && 
          thesis.title && thesis.title.toLowerCase().includes(query)) {
        score += 3;
      }

      // Search in abstract
      if ((searchIn === 'all' || searchIn === 'abstract') && 
          thesis.abstract && thesis.abstract.toLowerCase().includes(query)) {
        score += 2;
      }

      // Search in filename
      if (searchIn === 'all' && 
          thesis.filename && thesis.filename.toLowerCase().includes(query)) {
        score += 1;
      }

      if (score > 0) {
        results.push({
          ...thesis,
          score,
          relevance: getRelevanceLabel(score)
        });
      }
    });

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    // Limit to 10 results
    results = results.slice(0, 10);

    setSearchResults(results);
    setShowSearchResults(true);
    onSearch(); // Call parent search handler
  };

  const getRelevanceLabel = (score) => {
    if (score >= 3) return 'High';
    if (score >= 2) return 'Medium';
    return 'Low';
  };

  // Highlight search terms
  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
      e.target.blur(); // Hide keyboard on mobile
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowSearchResults(true);
    }
    if (searchContainerRef.current) {
      searchContainerRef.current.style.width = '300px';
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
    setSearchResults([]);
    setShowSearchResults(false);
    setIsSearchFocused(false);
    if (searchContainerRef.current) {
      searchContainerRef.current.style.width = '60px';
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <header className="custom-header">
      {/* Menu Button */}
      <button 
        className="menu-button"
        onClick={onMenuPress}
        aria-label="Menu"
      >
        <FaBars className="menu-icon" />
      </button>

      {/* Search Bar with Results */}
      <div className="search-wrapper">
        <div 
          ref={searchContainerRef}
          className={`search-container ${isSearchFocused || searchQuery ? 'search-focused' : ''}`}
        >
          {isSearchFocused || searchQuery ? (
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search thesis titles, abstracts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyPress={handleKeyPress}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
              />
              <button 
                className="filter-toggle"
                onClick={toggleFilters}
                aria-label="Search filters"
              >
                <FaFilter />
              </button>
            </div>
          ) : (
            <button 
              className="search-placeholder"
              onClick={handleSearchFocus}
              aria-label="Open search"
            >
              <FaSearch className="search-icon" />
            </button>
          )}

          {/* Clear Search Button */}
          {(isSearchFocused || searchQuery) && (
            <button 
              className="clear-button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FaTimes className="clear-icon" />
            </button>
          )}
        </div>

        {/* Filters Dropdown */}
        {showFilters && (
          <div className="filters-dropdown">
            <div className="filter-group">
              <label className="filter-label">
                <FaFolder /> Folder:
              </label>
              <select
                className="filter-select"
                value={filters.folder}
                onChange={(e) => handleFilterChange('folder', e.target.value)}
              >
                {folders.map(folder => (
                  <option key={folder} value={folder}>
                    {folder === 'all' ? 'All Folders' : folder}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FaCalendarAlt /> Year:
              </label>
              <select
                className="filter-select"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FaFileAlt /> Search in:
              </label>
              <select
                className="filter-select"
                value={filters.searchType}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              >
                <option value="all">All Fields</option>
                <option value="title">Title Only</option>
                <option value="abstract">Abstract Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div ref={resultsRef} className="search-results-dropdown">
            <div className="results-header">
              <span className="results-count">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </span>
              <button 
                className="close-results"
                onClick={() => setShowSearchResults(false)}
                aria-label="Close results"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div key={`${result.id}-${index}`} className="result-item">
                  <div className="result-header">
                    <span className={`relevance-badge ${result.relevance.toLowerCase()}`}>
                      {result.relevance}
                    </span>
                    <span className="result-folder">
                      <FaFolder /> {result.folder}
                    </span>
                  </div>
                  
                  <h4 className="result-title">
                    {highlightText(result.title, searchQuery)}
                  </h4>
                  
                  <p className="result-abstract">
                    {highlightText(
                      result.abstract.length > 120 
                        ? `${result.abstract.substring(0, 120)}...` 
                        : result.abstract,
                      searchQuery
                    )}
                  </p>
                  
                  <div className="result-meta">
                    {result.year_range && result.year_range !== 'unknown' && (
                      <span className="meta-item">
                        <FaCalendarAlt /> {result.year_range}
                      </span>
                    )}
                    <span className="meta-item">
                      <FaFileAlt /> {result.filename}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="results-footer">
              <span className="total-theses">
                Total in database: {theses.length} theses
              </span>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
          <div ref={resultsRef} className="search-results-dropdown no-results">
            <div className="no-results-message">
              <FaSearch className="no-results-icon" />
              <p>No results found for "{searchQuery}"</p>
              <small>Try different keywords or adjust filters</small>
            </div>
          </div>
        )}
      </div>

      {/* Notification Button */}
      <button className="notification-button" aria-label="Notifications">
        <FaBell className="notification-icon" />
      </button>
    </header>
  );
};

export default CustomHeader;