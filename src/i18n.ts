import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './locales/ko/common.json';
import en from './locales/en/common.json';
import ja from './locales/ja/common.json';
import zh from './locales/zh/common.json';

const resources = {
  ko: { common: ko },
  en: { common: en },
  ja: { common: ja },
  zh: { common: zh }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || (navigator.language ? navigator.language.split('-')[0] : 'ko'),
  fallbackLng: 'ko',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false }
});

export default i18n;
