import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import HomePage from './components/HomePage';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('equilink-language', lng);
  };

  return (
    <Router>
      <div className="App">
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
        >
          {t('skipToContent')}
        </a>
        
        <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1" aria-label="Equilink home">
                  <i className="fas fa-shield-alt text-primary-600 text-2xl" aria-hidden="true"></i>
                  <span className="ml-2 text-xl font-bold text-gray-800">{t('appName')}</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4" role="menubar">
                  <Link 
                    to="/" 
                    className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    role="menuitem"
                  >
                    {t('home')}
                  </Link>
                  <Link 
                    to="/report" 
                    className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    role="menuitem"
                  >
                    {t('submitReport')}
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    role="menuitem"
                  >
                    {t('dashboard')}
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <label htmlFor="language-select" className="sr-only">Select language</label>
                <select 
                  id="language-select"
                  onChange={(e) => changeLanguage(e.target.value)} 
                  value={i18n.language} 
                  className="border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Language selection"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="hi">हिंदी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="ml">മലയാളം</option>
                  <option value="te">తెలుగు</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
              </div>
            </div>
          </div>
        </nav>

        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
