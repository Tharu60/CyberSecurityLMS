import React from 'react';
import '../styles/LanguageToggle.css';

const LanguageToggle = ({ language, setLanguage }) => {
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'si' : 'en');
  };

  return (
    <div className="language-toggle-container">
      <button
        className="language-toggle-btn"
        onClick={toggleLanguage}
        aria-label={`Switch to ${language === 'en' ? 'Sinhala' : 'English'}`}
      >
        <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>EN</span>
        <span className="lang-divider">|</span>
        <span className={`lang-option ${language === 'si' ? 'active' : ''}`}>සි</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
