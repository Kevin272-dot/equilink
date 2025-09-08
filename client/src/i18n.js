import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import te from './locales/te.json';
import kn from './locales/kn.json';

i18n
  .use(initReactI18next)
  .init({
    resources: { 
  en: { translation: en }, 
  es: { translation: es }, 
  fr: { translation: fr },
  hi: { translation: hi },
  ta: { translation: ta },
  ml: { translation: ml },
  te: { translation: te },
  kn: { translation: kn }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;