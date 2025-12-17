"use client";

import { useLanguage } from "@/providers/LanguageProvider";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
      className="px-3 py-1 rounded-xl text-sm font-medium text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors border border-transparent hover:border-border"
    >
      {language === 'ru' ? 'EN' : 'RU'}
    </button>
  );
}