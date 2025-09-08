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
    } else {
      // Try to detect browser language if no preference is saved
      const browserLang = navigator.language.split('-')[0]; // Extract language code from locale
      const supportedLanguages = ['en', 'es', 'fr', 'hi', 'ta', 'ml', 'te', 'kn'];
      
      if (supportedLanguages.includes(browserLang)) {
        setLanguage(browserLang);
        i18n.changeLanguage(browserLang);
        localStorage.setItem('equilink-language', browserLang);
      }
    }
    
    // Focus first input after a short delay to ensure the form is rendered
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);
  }, [i18n]);  // Simplified approach: Always assume online with a simple health check
  useEffect(() => {
    // Always assume online by default - this ensures a better UX
    setIsOnline(true);
    
    // Simple function to check backend connectivity
    const checkBackendConnectivity = async () => {
      try {
        // Check our backend health endpoint
        await axios.get('/api/health', { 
          timeout: 3000,
          headers: { 'Cache-Control': 'no-cache' } 
        });
        setIsOnline(true);
        console.log("Health endpoint check successful");
      } catch (error) {
        // Only set offline if we're certain there's no connectivity
        // Just because our backend might be unreachable doesn't mean
        // we're truly offline - could be just our server having issues
        if (!error.response) {
          setIsOnline(false);
          console.log("Backend unreachable - might be offline");
        }
      }
    };
    
    // Check backend connectivity immediately on component mount
    checkBackendConnectivity();
    
    // Set up browser's online/offline event listeners
    const handleOnline = () => {
      console.log("Browser reports online event");
      setIsOnline(true);
      // Try to sync reports when we come back online
      syncReports();
    };
    
    const handleOffline = () => {
      console.log("Browser reports offline event");
      // Don't immediately assume offline - we'll verify with the health check
      checkBackendConnectivity();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up a periodic check every 30 seconds - less aggressive polling
    const intervalId = setInterval(checkBackendConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Define syncReports at component level to be able to call it from multiple places
  const syncReports = async () => {
    if (!isOnline) return; // Don't attempt to sync if we're not online
    
    const queued = await getQueuedReports();
    if (queued.length === 0) return; // No reports to sync
    
    let syncedCount = 0;
    for (const report of queued) {
      try {
        await axios.post('/reports', report);
        syncedCount++;
      } catch (e) {
        console.error('Sync failed for report', report.id, e);
        // Continue trying other reports instead of stopping completely
      }
    }
    
    if (syncedCount > 0) {
      await clearQueuedReports();
      setStatusMessage(syncedCount === 1 ? 
        t('reportSynced') : 
        t('reportsSynced', {count: syncedCount})
      );
    }
  };
  
  // Try to sync reports when we come online or component mounts
  useEffect(() => {
    if (isOnline) {
      syncReports();
    }
  }, [isOnline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show a temporary "submitting" status message
    setStatusMessage(t('submitting'));
    
    const report = { 
      id: crypto.randomUUID(), // Generate a unique ID for the report
      type, 
      description, 
      location,
      language,
      timestamp: new Date().toISOString() // Add timestamp for better tracking
    };
    
    // Create a timeout that will queue the report if submission takes too long
    let timeoutId = null;
    const timeoutPromise = new Promise(resolve => {
      timeoutId = setTimeout(() => {
        resolve('timeout');
      }, 5000); // 5 second timeout
    });
    
    try {
      // Race between actual submission and timeout
      const result = await Promise.race([
        axios.post('/reports', report),
        timeoutPromise
      ]);
      
      // Clear the timeout if submission succeeded
      clearTimeout(timeoutId);
      
      // Handle timeout case
      if (result === 'timeout') {
        throw new Error('Submission timed out');
      }
      
      // Success path
      setStatusMessage(t('reportSubmitted'));
      setIsOnline(true); // If we got here, we're definitely online
      console.log("Report submitted successfully");
      
      // Clear the form
      setType('');
      setDescription('');
      setLocation('');
    } catch (e) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);
      
      console.log("Report submission failed, queueing instead", e);
      
      // Queue the report
      await addReportToQueue(report);
      setStatusMessage(t('reportQueued'));
      
      // Only update offline status if we get a network error
      // But still clear the form - the report is saved in queue
      if (!e.response) {
        setIsOnline(false);
      }
      
      // Clear the form even on error - the report is saved in queue
      setType('');
      setDescription('');
      setLocation('');
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
        
        {/* Connection status banner - with improved style and clearer message */}
        <div className={`${isOnline ? 'bg-green-600' : 'bg-warning-500'} text-white px-4 py-2 flex items-center justify-between transition-all duration-300`} role="alert">
          <div className="flex items-center">
            <i className={`fas ${isOnline ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
            {isOnline ? t('onlineBanner') : t('offlineBanner')}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              // Check connectivity and attempt to sync reports
              setIsOnline(true);
              syncReports();
              console.log("Connectivity check and sync triggered");
            }}
            className="ml-2 bg-white hover:bg-gray-100 px-2 py-1 rounded text-sm flex items-center transition-colors duration-200"
            style={{ color: isOnline ? '#16a34a' : '#f59e0b' }}
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
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs text-gray-500">{isOnline ? t('statusOnline') : t('statusOffline')}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ReportForm;
