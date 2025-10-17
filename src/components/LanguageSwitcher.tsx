import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  const btnClass = 'px-3 py-1 rounded-md text-sm font-medium border-2 border-transparent hover:scale-105 transition-transform';

  return (
    <div className="flex items-center gap-2">
      {/* Korean button */}
      <button
        className={`${btnClass} ${i18n.language?.startsWith('ko') ? 'bg-gradient-to-br from-[#7342ff] to-[#db65d1] text-white' : 'bg-[#131739] text-white'}`}
        onClick={() => setLang('ko')}
      >한국어</button>
      <button className={`${btnClass} ${i18n.language?.startsWith('en') ? 'bg-gradient-to-br from-[#7342ff] to-[#db65d1] text-white' : 'bg-[#131739] text-white'}`} onClick={() => setLang('en')}>EN</button>
      <button className={`${btnClass} ${i18n.language?.startsWith('ja') ? 'bg-gradient-to-br from-[#7342ff] to-[#db65d1] text-white' : 'bg-[#131739] text-white'}`} onClick={() => setLang('ja')}>日本語</button>
      <button className={`${btnClass} ${i18n.language?.startsWith('zh') ? 'bg-gradient-to-br from-[#7342ff] to-[#db65d1] text-white' : 'bg-[#131739] text-white'}`} onClick={() => setLang('zh')}>中文</button>
    </div>
  );
}
