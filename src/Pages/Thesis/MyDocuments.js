import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUpload, 
  FaFilePdf, 
  FaFileWord, 
  FaFileAlt,
  FaDownload,
  FaSync,
  FaTimes,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaFolderOpen,
  FaEye,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import CustomHeader from '../Navigation/CustomHeader';
import HamburgerMenu from '../Navigation/HamburgerMenu';
import './MyDocuments.css';

const MyDocuments = () => {
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const fileInputRef = useRef(null);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload PDF, DOC, DOCX, or TXT files only');
      return;
    }

    setUploadedFile(file);
    await analyzeThesis(file);
  };

  const analyzeThesis = async (file) => {
    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('thesis', file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch('http://localhost:5001/api/analyze-thesis', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Response: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      const transformedResults = {
        overallScore: data.overallScore,
        statistics: data.statistics,
        recommendations: consolidateRecommendations(data.recommendations || [])
      };

      setAnalysisResults(transformedResults);
      toast.success('Thesis analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to the analysis server. Please make sure the Flask backend is running on http://localhost:5001');
      } else if (error.message.includes('HTML instead of JSON')) {
        toast.error('Backend server error. Please check the Flask console for error messages.');
      } else {
        toast.error(`Analysis failed: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const consolidateRecommendations = (recommendations) => {
    const consolidated = {};
    
    recommendations.forEach(rec => {
      const key = `${rec.category}-${rec.title}`;
      if (!consolidated[key]) {
        consolidated[key] = {
          ...rec,
          count: 1,
          instances: [rec]
        };
      } else {
        consolidated[key].count += 1;
        consolidated[key].instances.push(rec);
      }
    });

    return Object.values(consolidated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please upload PDF, DOC, DOCX, or TXT files only');
        return;
      }

      setUploadedFile(file);
      analyzeThesis(file);
    }
  };

  const triggerFileInput = () => {
    if (!isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().endsWith('.pdf')) return <FaFilePdf />;
    if (fileName?.toLowerCase().endsWith('.doc') || fileName?.toLowerCase().endsWith('.docx')) return <FaFileWord />;
    return <FaFileAlt />;
  };

  const groupRecommendationsByCategory = (recommendations) => {
    const grouped = {};
    
    recommendations.forEach(rec => {
      if (!grouped[rec.category]) {
        grouped[rec.category] = [];
      }
      grouped[rec.category].push(rec);
    });
    
    return Object.entries(grouped).map(([category, issues]) => ({
      category,
      issues
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const downloadReport = () => {
    if (!analysisResults) return;
    
    const report = {
      overallScore: analysisResults.overallScore,
      statistics: analysisResults.statistics,
      recommendations: analysisResults.recommendations,
      generatedAt: new Date().toISOString(),
      fileName: uploadedFile?.name
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-analysis-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setUploadedFile(null);
    setShowResults(false);
    setExpandedCategories({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Analysis reset. Ready for new file upload.');
  };

  const handleSearch = () => {
    if (searchQuery) {
      toast.info(`Searching documents for: ${searchQuery}`);
    }
  };

  const stats = [
    { label: 'Documents', value: analysisResults ? '1' : '0', icon: FaFolderOpen },
    { label: 'Analyzed', value: analysisResults ? '1' : '0', icon: FaCheckCircle },
    { label: 'In Queue', value: isAnalyzing ? '1' : '0', icon: FaClock },
  ];

  return (
    <div className="home-container">
      <CustomHeader
        onMenuPress={() => setIsMenuVisible(true)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage="My Documents"
      />

      <div className="home-gradient-background">
        <div className="home-scroll-container">
          <div className="home-content">
            <section className="hero-section">
              <div className="hero-content">
                <div className="greeting-container">
                  <h2 className="greeting-text">Thesis Analysis</h2>
                  <h1 className="hero-name">Document Review</h1>
                  <p className="hero-subtitle">
                    {analysisResults 
                      ? 'Analysis complete! View your results' 
                      : isAnalyzing 
                      ? 'Analyzing your thesis document...' 
                      : 'Upload your thesis for comprehensive analysis'
                    }
                  </p>
                </div>
                
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
              </div>
            </section>

            <section className="features-section">
              <div className="section-header">
                <h2 className="section-title">Upload Thesis</h2>
              </div>

              <div className="features-grid">
                <div 
                  className="feature-card"
                  onClick={triggerFileInput}
                >
                  <div 
                    className="feature-gradient"
                    style={{
                      background: `linear-gradient(135deg, ${isAnalyzing ? '#f59e0b' : analysisResults ? '#10b981' : '#6366f1'}, ${isAnalyzing ? '#d97706' : analysisResults ? '#059669' : '#4f46e5'})`
                    }}
                  >
                    <div className="feature-icon-container">
                      {isAnalyzing ? (
                        <div className="upload-loading-spinner"></div>
                      ) : analysisResults ? (
                        <FaCheckCircle className="feature-icon" />
                      ) : (
                        <FaUpload className="feature-icon" />
                      )}
                    </div>
                    <h3 className="feature-title">
                      {isAnalyzing ? 'Analyzing...' : 
                       analysisResults ? 'Analysis Complete' : 
                       'Upload Thesis'}
                    </h3>
                    <p className="feature-description">
                      {isAnalyzing ? 'Processing your document' :
                       analysisResults ? 'Click to view analysis results' :
                       'PDF, DOC, DOCX, or TXT files supported'}
                    </p>
                    <div className="feature-arrow">
                      <FaChartBar />
                    </div>
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                disabled={isAnalyzing}
              />

              {uploadedFile && (
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon document">
                      {getFileIcon(uploadedFile.name)}
                    </div>
                    <div className="activity-content">
                      <h4 className="activity-title">{uploadedFile.name}</h4>
                      <p className="activity-description">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {isAnalyzing ? 'Analyzing...' : 'Ready'}
                      </p>
                    </div>
                    <div className="activity-time-container">
                      {analysisResults && (
                        <button 
                          className="clear-search-button"
                          onClick={() => setShowResults(true)}
                          style={{ marginRight: '0.5rem' }}
                        >
                          <FaEye style={{ marginRight: '0.5rem' }} />
                          View Results
                        </button>
                      )}
                      {!isAnalyzing && (
                        <button 
                          className="see-all-button"
                          onClick={resetAnalysis}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>

                  {isAnalyzing && (
                    <div className="activity-item">
                      <div className="activity-content">
                        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '10px', height: '8px', marginBottom: '0.5rem' }}>
                          <div 
                            style={{ 
                              width: `${uploadProgress}%`, 
                              background: 'linear-gradient(135deg, #c7242c, #991b1b)',
                              height: '100%', 
                              borderRadius: '10px',
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>
                        <p className="activity-description">Processing... {uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="home-spacer" />
          </div>
        </div>
      </div>

      {/* Clean Results Modal */}
      {showResults && analysisResults && (
        <div className="clean-modal-overlay" onClick={() => setShowResults(false)}>
          <div className="clean-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="clean-modal-header">
              <div className="clean-modal-title-section">
                <h2 className="clean-modal-title">Analysis Results</h2>
                <p className="clean-modal-subtitle">{uploadedFile?.name}</p>
              </div>
              <button 
                className="clean-modal-close"
                onClick={() => setShowResults(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="clean-modal-content">
              {/* Score Section */}
              <div className="clean-score-section">
                <div className="clean-score-circle">
                  <span className="clean-score-number">{analysisResults.overallScore}</span>
                  <span className="clean-score-label">/100</span>
                </div>
                <div className="clean-score-info">
                  <h3>Overall Score</h3>
                  <p>Document quality assessment</p>
                </div>
              </div>

              {/* Stats */}
              <div className="clean-stats-grid">
                <div className="clean-stat">
                  <span className="clean-stat-number">{analysisResults.statistics?.wordCount || 0}</span>
                  <span className="clean-stat-label">Words</span>
                </div>
                <div className="clean-stat">
                  <span className="clean-stat-number">{analysisResults.statistics?.sentenceCount || 0}</span>
                  <span className="clean-stat-label">Sentences</span>
                </div>
                <div className="clean-stat">
                  <span className="clean-stat-number">{analysisResults.statistics?.paragraphCount || 0}</span>
                  <span className="clean-stat-label">Paragraphs</span>
                </div>
                <div className="clean-stat">
                  <span className="clean-stat-number">{Math.round(analysisResults.statistics?.readabilityScore || 0)}</span>
                  <span className="clean-stat-label">Readability</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="clean-recommendations">
                <h3 className="clean-recommendations-title">Recommendations</h3>
                <div className="clean-recommendations-list">
                  {groupRecommendationsByCategory(analysisResults.recommendations).map((category, index) => (
                    <div key={index} className="clean-category">
                      <div 
                        className="clean-category-header"
                        onClick={() => toggleCategory(category.category)}
                      >
                        <div className="clean-category-info">
                          <div 
                            className="clean-category-dot"
                            style={{ backgroundColor: getSeverityColor(category.issues[0]?.severity || 'medium') }}
                          ></div>
                          <span className="clean-category-name">{category.category}</span>
                          <span className="clean-category-count">({category.issues.length})</span>
                        </div>
                        {expandedCategories[category.category] ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                      
                      {expandedCategories[category.category] && (
                        <div className="clean-category-content">
                          {category.issues.map((issue, issueIndex) => (
                            <div key={issueIndex} className="clean-recommendation">
                              <div className="clean-recommendation-header">
                                <span className="clean-issue-title">{issue.title}</span>
                                <div className="clean-issue-meta">
                                  {issue.count > 1 && (
                                    <span className="clean-occurrence-count">
                                      {issue.count}x
                                    </span>
                                  )}
                                  <span 
                                    className="clean-severity-badge"
                                    style={{ backgroundColor: getSeverityColor(issue.severity) }}
                                  >
                                    {issue.severity}
                                  </span>
                                </div>
                              </div>
                              <p className="clean-issue-description">{issue.description}</p>
                              <div className="clean-suggestion">
                                <strong>💡</strong> {issue.suggestion}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="clean-modal-actions">
              <button className="clean-download-btn" onClick={downloadReport}>
                <FaDownload />
                Download Report
              </button>
              <button className="clean-analyze-btn" onClick={resetAnalysis}>
                <FaSync />
                Analyze Another
              </button>
            </div>
          </div>
        </div>
      )}

      <HamburgerMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </div>
  );
};

export default MyDocuments;