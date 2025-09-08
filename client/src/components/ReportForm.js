import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { addReportToQueue, getQueuedReports, clearQueuedReports } from '../db';
import { useTranslation } from 'react-i18next';

function ReportForm() {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState(i18n.language);
  const [statusMessage, setStatusMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const firstInputRef = useRef();

  // Load saved language preference on mount and focus first input
  useEffect(() => {
    // Check if there's a saved language preference
    const savedLang = localStorage.getItem('equilink-language');
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
    
    // Focus first input
    firstInputRef.current.focus();
  }, [i18n]);

  // Check actual online connectivity
  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        // Send a small HEAD request to the root URL to verify actual connectivity
        await axios.head('/', { timeout: 3000 });
        setIsOnline(true);
      } catch (error) {
        // If the request fails with a response, the server is still reachable
        if (error.response) {
          setIsOnline(true);
        } else {
          // No response means we're truly offline
          setIsOnline(false);
        }
      }
    };

    // Check status initially
    checkOnlineStatus();

    // Set up event listeners for online/offline events
    const handleOnline = () => {
      checkOnlineStatus(); // Verify we're actually online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up a periodic check every 30 seconds
    const intervalId = setInterval(checkOnlineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // sync queued reports when back online
  useEffect(() => {
    async function syncReports() {
      if (!isOnline) return; // Don't attempt to sync if we're not online
      
      const queued = await getQueuedReports();
      if (queued.length === 0) return; // No reports to sync
      
      for (const report of queued) {
        try {
          await axios.post('/reports', report);
        } catch (e) {
          console.error('Sync failed', e);
          return;
        }
      }
      await clearQueuedReports();
      setStatusMessage(t('reportsSynced'));
    }
    
    // Try to sync when online status changes to true
    if (isOnline) {
      syncReports();
    }
    
  }, [isOnline, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const report = { 
      id: crypto.randomUUID(), // Generate a unique ID for the report
      type, 
      description, 
      location,
      language,
      timestamp: new Date().toISOString() // Add timestamp for better tracking
    };
    if (isOnline) {
      try {
        await axios.post('/reports', report);
        setStatusMessage(t('reportSubmitted'));
      } catch (e) {
        // If the post fails, queue the report
        await addReportToQueue(report);
        setStatusMessage(t('reportQueued'));
      }
    } else {
      await addReportToQueue(report);
      setStatusMessage(t('reportQueued'));
    }
    setType('');
    setDescription('');
    setLocation('');
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
        
        {/* Offline banner */}
        {!isOnline && (
          <div className="bg-warning-500 text-white px-4 py-2 flex items-center justify-center" role="alert">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {t('offlineBanner')}
          </div>
        )}

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
                <input
                  id="type"
                  ref={firstInputRef}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  required
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder={t('typePlaceholder')}
                />
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
          
          {/* Status message */}
          {statusMessage && (
            <div className="mt-6 rounded-md bg-green-50 p-4 animate-[fadeIn_0.5s_ease-out_forwards]" role="status">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-check-circle text-green-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3">
          <p className="text-xs text-center text-gray-500">
            {t('privacyMessage')}
          </p>
        </div>
      </div>
    </main>
  );
}

export default ReportForm;
