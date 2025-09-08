import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { addReportToQueue, getQueuedReports, clearQueuedReports } from '../db';
import { useTranslation } from 'react-i18next';

function ReportForm() {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
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
    const report = { type, description, language };
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
          <label htmlFor="language">{t('languageLabel')}</label>
          <select id="language" value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <button type="submit">{t('submit')}</button>
      </form>
      {statusMessage && <div role="status">{statusMessage}</div>}
    </main>
  );
}

export default ReportForm;
