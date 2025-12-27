"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TariffsPage() {
  const { dict } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-entry">
      <Link href="/" className="inline-flex items-center text-textMuted hover:text-textMain mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {dict.common.back}
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-textMain">{dict.common.tariffs}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic */}
        <div className="glass p-8 rounded-3xl border border-border flex flex-col">
          <h2 className="text-2xl font-bold text-textMain mb-2">{dict.common.basic}</h2>
          <p className="text-textMuted mb-4">{dict.common.forBeginners}</p>
          <div className="text-3xl font-bold text-textMain mb-6">
            300 ₽ <span className="text-sm text-textMuted font-normal">{dict.common.month}</span>
            <div className="text-sm text-textMuted font-normal mt-1">3000 ₽ {dict.common.year}</div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.delivery24h}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.moderation12days}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.standardAnalytics}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.standardPromo}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.smartLinks}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{dict.common.finance80}</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>{dict.common.instrumentalFfp}</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>{dict.common.countryAnalytics}</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>{dict.common.artistCardControl}</span>
            </li>
          </ul>

          <a
            href="https://t.me/culturamediasup"
            target="_blank"
            rel="noreferrer"
            className="w-full block text-center py-3 rounded-xl border border-primary text-primary hover:bg-primary/10 transition-colors font-medium"
          >
            {dict.common.buy}
          </a>
        </div>

        {/* Premium */}
        <div className="glass p-8 rounded-3xl border border-primary/50 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">{dict.common.popular}</div>
          <h2 className="text-2xl font-bold text-textMain mb-2">{dict.common.premium}</h2>
          <p className="text-textMuted mb-4">{dict.common.forPros}</p>
          <div className="text-3xl font-bold text-textMain mb-6">
            600 ₽ <span className="text-sm text-textMuted font-normal">{dict.common.month}</span>
            <div className="text-sm text-textMuted font-normal mt-1">5000 ₽ {dict.common.year}</div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.delivery6h}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.moderation1224h}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.extendedAnalytics}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.acceleratedPromo}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.smartLinks}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.finance85}</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.instrumentalFfp}*</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>{dict.common.artistCardControl}</span>
            </li>
          </ul>
          <p className="text-xs text-textMuted mb-6">{dict.common.ffpWarning}</p>

          <a
            href="https://t.me/culturamediasup"
            target="_blank"
            rel="noreferrer"
            className="w-full block text-center py-3 rounded-xl bg-primary text-white hover:bg-primaryHover transition-colors font-medium shadow-lg shadow-primary/25"
          >
            {dict.common.buy}
          </a>
        </div>
      </div>
    </div>
  );
}