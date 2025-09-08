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
  const firstInputRef = useRef();

  // focus first input on mount
  useEffect(() => {
    firstInputRef.current.focus();
  }, []);

  // sync queued reports when back online
  useEffect(() => {
    async function syncReports() {
      const queued = await getQueuedReports();
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
    window.addEventListener('online', syncReports);
    return () => window.removeEventListener('online', syncReports);
  }, [t]);

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
    if (navigator.onLine) {
      try {
        await axios.post('/reports', report);
        setStatusMessage(t('reportSubmitted'));
      } catch (e) {
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
      {!navigator.onLine && <div role="alert">{t('offlineBanner')}</div>}
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
