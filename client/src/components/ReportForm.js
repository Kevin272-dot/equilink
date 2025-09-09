import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { addReportToQueue, getQueuedReports, clearQueuedReports } from '../db';
import { useTranslation } from 'react-i18next';

function ReportForm() {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [statusMessage, setStatusMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const firstInputRef = useRef();

  // Define syncReports with useCallback
  const syncReports = useCallback(async () => {
    try {
      if (!isOnline) return;
      
      const queued = await getQueuedReports();
      if (queued.length === 0) return;
      
      let syncedCount = 0;
      for (const report of queued) {
        try {
          await axios.post('/reports', report);
          syncedCount++;
        } catch (e) {
          console.error('Sync failed for report', report.id, e);
        }
      }
      
      if (syncedCount > 0) {
        await clearQueuedReports();
        setStatusMessage(syncedCount === 1 ? t('reportSynced') : t('reportsSynced'));
      }
    } catch (error) {
      console.error('Error in syncReports:', error);
    }
  }, [isOnline, t]);

  // Load saved language preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('equilink-language');
      if (savedLang) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      } else {
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = ['en', 'es', 'fr', 'hi', 'ta', 'ml', 'te', 'kn'];
        if (supportedLanguages.includes(browserLang)) {
          setLanguage(browserLang);
          i18n.changeLanguage(browserLang);
          localStorage.setItem('equilink-language', browserLang);
        }
      }
      
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error in language setup:', error);
    }
  }, [i18n]);

  // Online status management
  useEffect(() => {
    try {
      setIsOnline(true);
      
      const checkHealth = async () => {
        try {
          await axios.get('/api/health', { timeout: 2000 });
          setIsOnline(true);
        } catch (error) {
          console.log('Health check failed, but staying online');
        }
      };
      
      const handleOnline = () => {
        setIsOnline(true);
        syncReports();
      };
      
      window.addEventListener('online', handleOnline);
      checkHealth();
      syncReports();
      
      const intervalId = setInterval(checkHealth, 60000);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        clearInterval(intervalId);
      };
    } catch (error) {
      console.error('Error in online status setup:', error);
    }
  }, [syncReports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setStatusMessage(t('submitting'));
      
      const report = { 
        id: crypto.randomUUID(),
        type, 
        description, 
        location,
        language,
        timestamp: new Date().toISOString()
      };
      
      try {
        await axios.post('/reports', report, { timeout: 8000 });
        setStatusMessage(t('reportSubmitted'));
        setType('');
        setDescription('');
        setLocation('');
      } catch (e) {
        await addReportToQueue(report);
        setStatusMessage(t('reportQueued'));
        setType('');
        setDescription('');
        setLocation('');
        setTimeout(() => syncReports(), 3000);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setStatusMessage('Error submitting report. Please try again.');
    }
  };

  // Determine text direction based on language
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(language);
  const dirAttribute = isRTL ? 'rtl' : 'ltr';

  return (
    <main 
      className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8" 
      role="main"
      dir={dirAttribute}
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl animate-[fadeIn_0.5s_ease-out_forwards]">
        {/* Header with logo */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4">
          <div className="flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-3xl mr-3"></i>
            <h1 className="text-2xl font-bold text-white">{t('appTitle')}</h1>
          </div>
        </div>
        
        {/* Status banner - simplified to avoid confusion */}
        <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between transition-all duration-300" role="alert">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {t('readyBanner')}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              syncReports();
              console.log("Sync reports triggered");
            }}
            className="ml-2 bg-white hover:bg-gray-100 px-2 py-1 rounded text-sm flex items-center transition-colors duration-200 text-green-600"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            {t('syncReports')}
          </button>
        </div>

        {/* Form card */}
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit} aria-labelledby="report-form" className="space-y-6">
            <div className="animate-[slideUp_0.4s_ease-out_0.1s_forwards] opacity-0">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                {t('typeLabel')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-tag text-gray-400"></i>
                </div>
                <select
                  id="type"
                  ref={firstInputRef}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  required
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">{t('selectIncidentType')}</option>
                  <optgroup label={t('harassmentDiscrimination')}>
                    <option value="sexualHarassment">{t('sexualHarassment')}</option>
                    <option value="verbalAbuse">{t('verbalAbuse')}</option>
                    <option value="physicalViolence">{t('physicalViolence')}</option>
                    <option value="genderDiscrimination">{t('genderDiscrimination')}</option>
                    <option value="raceDiscrimination">{t('raceDiscrimination')}</option>
                    <option value="ageDiscrimination">{t('ageDiscrimination')}</option>
                    <option value="religionDiscrimination">{t('religionDiscrimination')}</option>
                    <option value="disabilityDiscrimination">{t('disabilityDiscrimination')}</option>
                  </optgroup>
                  <optgroup label={t('safetyConcerns')}>
                    <option value="unsafeConditions">{t('unsafeConditions')}</option>
                    <option value="equipmentFailure">{t('equipmentFailure')}</option>
                    <option value="environmentalHazards">{t('environmentalHazards')}</option>
                  </optgroup>
                  <optgroup label={t('workplaceIssues')}>
                    <option value="bullying">{t('bullying')}</option>
                    <option value="retaliation">{t('retaliation')}</option>
                    <option value="policyViolation">{t('policyViolation')}</option>
                    <option value="ethicsViolation">{t('ethicsViolation')}</option>
                    <option value="fraud">{t('fraud')}</option>
                    <option value="dataPrivacy">{t('dataPrivacy')}</option>
                  </optgroup>
                </select>
              </div>
            </div>
            
            <div className="animate-[slideUp_0.4s_ease-out_0.2s_forwards] opacity-0">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('descriptionLabel')}
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>
            </div>
            
            <div className="animate-[slideUp_0.4s_ease-out_0.3s_forwards] opacity-0">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                {t('locationLabel')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-map-marker-alt text-gray-400"></i>
                </div>
                <input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder={t('locationPlaceholder')}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="animate-[slideUp_0.4s_ease-out_0.4s_forwards] opacity-0">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                {t('languageLabel')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-language text-gray-400"></i>
                </div>
                <select 
                  id="language" 
                  value={language} 
                  onChange={e => {
                    const newLang = e.target.value;
                    setLanguage(newLang);
                    i18n.changeLanguage(newLang); // Change the UI language immediately
                    localStorage.setItem('equilink-language', newLang); // Save language preference
                  }}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
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
            
            <div className="animate-[slideUp_0.4s_ease-out_0.5s_forwards] opacity-0 pt-2">
              <button 
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {t('submit')}
              </button>
            </div>
          </form>
          
          {/* Status message with better color coding and animations */}
          {statusMessage && (
            <div 
              className={`mt-6 rounded-md p-4 animate-[fadeIn_0.5s_ease-out_forwards] ${
                statusMessage === t('submitting') ? 'bg-blue-50' : 
                statusMessage === t('reportQueued') ? 'bg-yellow-50' : 'bg-green-50'
              }`} 
              role="status"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className={`fas ${
                    statusMessage === t('submitting') ? 'fa-spinner fa-spin text-blue-500' : 
                    statusMessage === t('reportQueued') ? 'fa-clock text-yellow-500' : 'fa-check-circle text-green-500'
                  }`}></i>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    statusMessage === t('submitting') ? 'text-blue-800' : 
                    statusMessage === t('reportQueued') ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {t('privacyMessage')}
            </p>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
              <span className="text-xs text-gray-500">{t('statusOnline')}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ReportForm;
