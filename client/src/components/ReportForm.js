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

  // focus first input on mount
  useEffect(() => {
    firstInputRef.current.focus();
  }, []);

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

  return (
    <main role="main">
      <h1>{t('appTitle')}</h1>
      {!isOnline && <div role="alert">{t('offlineBanner')}</div>}
      <form onSubmit={handleSubmit} aria-labelledby="report-form">
        <div>
          <label htmlFor="type">{t('typeLabel')}</label>
          <input
            id="type"
            ref={firstInputRef}
            value={type}
            onChange={e => setType(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">{t('descriptionLabel')}</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">{t('locationLabel')}</label>
          <input
            id="location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="City, Region, Country"
          />
        </div>
        <div>
          <label htmlFor="language">{t('languageLabel')}</label>
          <select id="language" value={language} onChange={e => setLanguage(e.target.value)}>
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
        <button type="submit">{t('submit')}</button>
      </form>
      {statusMessage && <div role="status">{statusMessage}</div>}
    </main>
  );
}

export default ReportForm;
