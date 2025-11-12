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
  FaLightbulb
} from 'react-icons/fa';
import CustomHeader from './Navigation/CustomHeader';
import HamburgerMenu from './Navigation/HamburgerMenu';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [filteredFeatures, setFilteredFeatures] = useState([]);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Filter features based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = features.filter(feature =>
        feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFeatures(filtered);
    } else {
      setFilteredFeatures(features);
    }
  }, [searchQuery]);

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
      description: 'Advanced analysis tools for your research papers',
      gradient: ['#6366f1', '#4f46e5'],
    },
    {
      icon: FaFileAlt,
      title: 'Document Management',
      description: 'Organize and manage all your thesis documents',
      gradient: ['#ec4899', '#db2777'],
    },
    {
      icon: FaSearch,
      title: 'Smart Search',
      description: 'Find relevant research papers quickly',
      gradient: ['#8b5cf6', '#7c3aed'],
    },
    {
      icon: FaChartLine,
      title: 'Progress Tracking',
      description: 'Monitor your research progress and milestones',
      gradient: ['#14b8a6', '#0d9488'],
    },
    {
      icon: FaBook,
      title: 'Thesis Library',
      description: 'Access comprehensive thesis database',
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      icon: FaChartBar,
      title: 'Research Trends',
      description: 'Discover latest research trends and patterns',
      gradient: ['#10b981', '#059669'],
    }
  ];

  const stats = [
    { label: 'Active Projects', value: '12', icon: FaFolderOpen },
    { label: 'Completed', value: '48', icon: FaCheckCircle },
    { label: 'In Progress', value: '8', icon: FaClock },
  ];

  const handleSearch = () => {
    if (searchQuery) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleFeaturePress = (feature) => {
    console.log('Feature pressed:', feature.title);
  };

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
                
                {/* Stats Cards - Only show when not searching */}
                {!searchQuery && (
                  <div className="stats-container">
                    {stats.map((stat, index) => {
                      const IconComponent = stat.icon;
                      return (
                        <div key={index} className="stat-card">
                          <IconComponent className="stat-icon" />
                          <div className="stat-value">{stat.value}</div>
                          <div className="stat-label">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Search Results Count */}
            {searchQuery && (
              <div className="search-results-section">
                <FaFilter className="filter-icon" />
                <span className="search-results-text">
                  {filteredFeatures.length} result{filteredFeatures.length !== 1 ? 's' : ''} found
                </span>
              </div>
            )}

            {/* Features Section */}
            <section className="features-section">
              <div className="section-header">
                <h2 className="section-title">
                  {searchQuery ? 'Search Results' : 'Quick Actions'}
                </h2>
                {!searchQuery && (
                  <button className="see-all-button">
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

              {/* No Results */}
              {searchQuery && filteredFeatures.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon-container">
                    <FaSearch className="no-results-icon" />
                  </div>
                  <h3 className="no-results-text">No results found</h3>
                  <p className="no-results-subtext">
                    Try adjusting your search terms or browse all features
                  </p>
                  <button 
                    className="clear-search-button"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </section>

            {/* Recent Activity - Only show when not searching */}
            {!searchQuery && (
              <section className="activity-section">
                <div className="section-header">
                  <h2 className="section-title">Recent Activity</h2>
                  <button className="see-all-button">
                    View All
                  </button>
                </div>
                
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon document">
                      <FaFileAlt />
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">Thesis Updated</h4>
                      <p className="activity-description">"AI in Education" document modified</p>
                    </div>
                    <div className="activity-time-container">
                      <span className="activity-time">2h</span>
                      <FaChevronRight className="activity-arrow" />
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon analytics">
                      <FaChartBar />
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">Analysis Complete</h4>
                      <p className="activity-description">Research paper analysis finished</p>
                    </div>
                    <div className="activity-time-container">
                      <span className="activity-time">1d</span>
                      <FaChevronRight className="activity-arrow" />
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon library">
                      <FaBook />
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">Library Updated</h4>
                      <p className="activity-description">3 new theses added to collection</p>
                    </div>
                    <div className="activity-time-container">
                      <span className="activity-time">2d</span>
                      <FaChevronRight className="activity-arrow" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Quick Tips Section - Only show when not searching */}
            {!searchQuery && (
              <section className="tips-section">
                <div className="tip-card">
                  <FaLightbulb className="tip-icon" />
                  <div className="tip-content">
                    <h4 className="tip-title">Pro Tip</h4>
                    <p className="tip-text">
                      Use Smart Search to find relevant papers based on keywords and citations
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