import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartBar, 
  FaFileAlt, 
  FaSearch, 
  FaChartLine, 
  FaBook, 
  FaFolderOpen,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaArrowRight,
  FaChevronRight,
  FaLightbulb,
  FaFolder,
  FaCalendarAlt,
  FaFile,
  FaGraduationCap
} from 'react-icons/fa';
import CustomHeader from './Navigation/CustomHeader';
import HamburgerMenu from './Navigation/HamburgerMenu';
import './Home.css';

// Import your JSON data
import thesisData from '../data/trained_model.json';

const Home = () => {
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [theses, setTheses] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    folder: 'all',
    year: 'all',
    searchIn: 'all'
  });
  const [showSearchDetails, setShowSearchDetails] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadUserData();
    loadThesesData();
  }, []);

  // Load thesis data from JSON
  const loadThesesData = () => {
    try {
      // Extract theses from your JSON structure
      const thesesList = thesisData.theses || thesisData;
      setTheses(thesesList);
      
      // Initialize features with thesis stats
      initializeFeatures(thesesList);
    } catch (error) {
      console.error('Error loading thesis data:', error);
      setTheses([]);
    }
  };

  // Initialize features with actual thesis statistics
  const initializeFeatures = (thesesList) => {
    const totalTheses = thesesList.length;
    const uniqueFolders = [...new Set(thesesList.map(t => t.folder).filter(Boolean))];
    const uniqueYears = [...new Set(thesesList.map(t => t.year_range).filter(y => y && y !== 'unknown'))];
    
    // Update features with real statistics
    setFilteredFeatures(features.map(feature => {
      if (feature.title === 'Thesis Library') {
        return {
          ...feature,
          description: `Access ${totalTheses} thesis abstracts`
        };
      }
      if (feature.title === 'Smart Search') {
        return {
          ...feature,
          description: `Search across ${totalTheses} research papers`
        };
      }
      return feature;
    }));
  };

  // Search function for theses
  const searchTheses = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    let results = [];

    // Search through theses
    theses.forEach(thesis => {
      // Apply filters
      if (searchFilters.folder !== 'all' && thesis.folder !== searchFilters.folder) return;
      if (searchFilters.year !== 'all' && thesis.year_range !== searchFilters.year) return;

      let score = 0;
      const searchIn = searchFilters.searchIn;

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

    // Sort by score (highest first) and limit
    results.sort((a, b) => b.score - a.score);
    results = results.slice(0, 20);

    setSearchResults(results);
    setIsSearching(false);
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

  // Auto-search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTheses();
        setShowSearchDetails(true);
      } else {
        setSearchResults([]);
        setIsSearching(false);
        setShowSearchDetails(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilters]);

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

  const features = [
    {
      icon: FaChartBar,
      title: 'Thesis Analysis',
      description: 'Analyze thesis quality and structure',
      gradient: ['#6366f1', '#4f46e5'],
      path: '/analyze'
    },
    {
      icon: FaFileAlt,
      title: 'Document Management',
      description: 'Organize and manage thesis documents',
      gradient: ['#ec4899', '#db2777'],
      path: '/documents'
    },
    {
      icon: FaSearch,
      title: 'Smart Search',
      description: 'Search across thesis database',
      gradient: ['#8b5cf6', '#7c3aed'],
      path: '/search'
    },
    {
      icon: FaChartLine,
      title: 'Progress Tracking',
      description: 'Monitor research progress',
      gradient: ['#14b8a6', '#0d9488'],
      path: '/progress'
    },
    {
      icon: FaBook,
      title: 'Thesis Library',
      description: 'Access thesis abstracts database',
      gradient: ['#f59e0b', '#d97706'],
      path: '/library'
    },
    {
      icon: FaGraduationCap,
      title: 'Research Trends',
      description: 'Discover latest research patterns',
      gradient: ['#10b981', '#059669'],
      path: '/trends'
    }
  ];

  const stats = [
    { 
      label: 'Total Theses', 
      value: theses.length.toString(), 
      icon: FaFolderOpen,
      color: '#6366f1'
    },
    { 
      label: 'Unique Folders', 
      value: [...new Set(theses.map(t => t.folder).filter(Boolean))].length.toString(), 
      icon: FaFolder,
      color: '#ec4899'
    },
    { 
      label: 'Years Covered', 
      value: [...new Set(theses.map(t => t.year_range).filter(y => y && y !== 'unknown'))].length.toString(), 
      icon: FaCalendarAlt,
      color: '#8b5cf6'
    },
  ];

  const handleSearch = () => {
    if (searchQuery) {
      searchTheses();
    }
  };

  const handleFeaturePress = (feature) => {
    console.log('Feature pressed:', feature.title);
    if (feature.path) {
      navigate(feature.path);
    }
  };

  const handleThesisClick = (thesis) => {
    console.log('Thesis clicked:', thesis.title);
    // Navigate to thesis detail view or show modal
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDetails(false);
  };

  // Get unique filters
  const folders = ['all', ...new Set(theses.map(t => t.folder).filter(Boolean))];
  const years = ['all', ...new Set(theses.map(t => t.year_range).filter(y => y && y !== 'unknown'))];

  return (
    <div className="home-container">
      {/* Custom Header */}
      <CustomHeader
        onMenuPress={() => setIsMenuVisible(true)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="home-gradient-background">
        <div className="home-scroll-container">
          <div className="home-content">
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <div className="greeting-container">
                  <h2 className="greeting-text">Hello,</h2>
                  <h1 className="hero-name">{user?.name || 'Researcher'}</h1>
                  <p className="hero-subtitle">
                    {searchQuery ? `Searching for "${searchQuery}"` : 'What would you like to explore today?'}
                  </p>
                </div>
                
                {/* Stats Cards - Show thesis statistics */}
                {!searchQuery && (
                  <div className="stats-container">
                    {stats.map((stat, index) => {
                      const IconComponent = stat.icon;
                      return (
                        <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                          <IconComponent className="stat-icon" style={{ color: stat.color }} />
                          <div className="stat-value">{stat.value}</div>
                          <div className="stat-label">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Search Results Header */}
            {searchQuery && (
              <div className="search-results-section">
                <div className="search-results-header">
                  <FaFilter className="filter-icon" />
                  <div className="search-results-info">
                    <span className="search-results-text">
                      {isSearching ? 'Searching...' : `${searchResults.length} thesis result${searchResults.length !== 1 ? 's' : ''} found`}
                    </span>
                    {!isSearching && searchResults.length > 0 && (
                      <div className="search-filters-display">
                        <span className="filter-badge">
                          <FaFolder /> {searchFilters.folder === 'all' ? 'All Folders' : searchFilters.folder}
                        </span>
                        <span className="filter-badge">
                          <FaCalendarAlt /> {searchFilters.year === 'all' ? 'All Years' : searchFilters.year}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results Grid */}
            {showSearchDetails && searchResults.length > 0 && (
              <section className="thesis-results-section">
                <div className="thesis-results-grid">
                  {searchResults.map((thesis, index) => (
                    <div 
                      key={`${thesis.id}-${index}`}
                      className="thesis-result-card"
                      onClick={() => handleThesisClick(thesis)}
                    >
                      <div className="thesis-result-header">
                        <span className={`relevance-badge relevance-${thesis.relevance.toLowerCase()}`}>
                          {thesis.relevance}
                        </span>
                        <span className="thesis-folder">
                          <FaFolder /> {thesis.folder}
                        </span>
                      </div>
                      
                      <h3 className="thesis-result-title">
                        {highlightText(thesis.title, searchQuery)}
                      </h3>
                      
                      <p className="thesis-result-abstract">
                        {highlightText(
                          thesis.abstract.length > 150 
                            ? `${thesis.abstract.substring(0, 150)}...` 
                            : thesis.abstract,
                          searchQuery
                        )}
                      </p>
                      
                      <div className="thesis-result-meta">
                        {thesis.year_range && thesis.year_range !== 'unknown' && (
                          <span className="thesis-meta-item">
                            <FaCalendarAlt /> {thesis.year_range}
                          </span>
                        )}
                        <span className="thesis-meta-item">
                          <FaFile /> {thesis.filename}
                        </span>
                      </div>
                      
                      <div className="thesis-result-footer">
                        <span className="thesis-source">
                          Source: {thesis.source}
                        </span>
                        <span className="thesis-words">
                          {thesis.word_count} words
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="no-results-section">
                <div className="no-results-card">
                  <div className="no-results-icon-container">
                    <FaSearch className="no-results-icon" />
                  </div>
                  <h3 className="no-results-text">No theses found</h3>
                  <p className="no-results-subtext">
                    Try different keywords or browse all features
                  </p>
                  <div className="no-results-actions">
                    <button 
                      className="clear-search-button"
                      onClick={clearSearch}
                    >
                      Clear Search
                    </button>
                    <button 
                      className="browse-all-button"
                      onClick={() => navigate('/library')}
                    >
                      Browse All Theses
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Features Section - Only show when not searching or no results */}
            {(!searchQuery || searchResults.length === 0) && (
              <section className="features-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {searchQuery ? 'Try These Features' : 'Quick Actions'}
                  </h2>
                  {!searchQuery && (
                    <button 
                      className="see-all-button"
                      onClick={() => navigate('/features')}
                    >
                      See All
                    </button>
                  )}
                </div>
                
                <div className="features-grid">
                  {filteredFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div 
                        key={index} 
                        className="feature-card"
                        onClick={() => handleFeaturePress(feature)}
                      >
                        <div 
                          className="feature-gradient"
                          style={{
                            background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`
                          }}
                        >
                          <div className="feature-icon-container">
                            <IconComponent className="feature-icon" />
                          </div>
                          <h3 className="feature-title">{feature.title}</h3>
                          <p className="feature-description">{feature.description}</p>
                          <div className="feature-arrow">
                            <FaArrowRight />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recent Activity - Only show when not searching */}
            {!searchQuery && (
              <section className="activity-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Thesis Updates</h2>
                  <button 
                    className="see-all-button"
                    onClick={() => navigate('/library')}
                  >
                    View All
                  </button>
                </div>
                
                <div className="activity-list">
                  {/* Show recent theses from JSON */}
                  {theses.slice(0, 3).map((thesis, index) => (
                    <div key={index} className="activity-item">
                      <div 
                        className="activity-icon"
                        style={{ 
                          background: index === 0 ? '#6366f1' : 
                                   index === 1 ? '#ec4899' : '#8b5cf6'
                        }}
                      >
                        <FaFileAlt />
                      </div>
                      <div className="activity-content">
                        <h4 className="activity-title">{thesis.title}</h4>
                        <p className="activity-description">
                          {thesis.folder} • {thesis.year_range !== 'unknown' ? thesis.year_range : 'No date'}
                        </p>
                      </div>
                      <div className="activity-time-container">
                        <span className="activity-time">New</span>
                        <FaChevronRight className="activity-arrow" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Tips Section - Only show when not searching */}
            {!searchQuery && (
              <section className="tips-section">
                <div className="tip-card">
                  <FaLightbulb className="tip-icon" />
                  <div className="tip-content">
                    <h4 className="tip-title">Database Info</h4>
                    <p className="tip-text">
                      You have access to {theses.length} thesis abstracts. 
                      Use the search to find specific research topics.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="home-spacer" />
          </div>
        </div>
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </div>
  );
};

export default Home;