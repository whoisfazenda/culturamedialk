"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function TariffsPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 animate-entry">
      <Link href="/" className="inline-flex items-center text-textMuted hover:text-textMain mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-textMain">Тарифные планы</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic */}
        <div className="glass p-8 rounded-3xl border border-border flex flex-col">
          <h2 className="text-2xl font-bold text-textMain mb-2">Базовый</h2>
          <p className="text-textMuted mb-4">Для начинающих артистов</p>
          <div className="text-3xl font-bold text-textMain mb-6">
            300 ₽ <span className="text-sm text-textMuted font-normal">/ месяц</span>
            <div className="text-sm text-textMuted font-normal mt-1">3000 ₽ / год</div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Отгрузка на площадки от 24 часов</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Модерация 1-2 дня</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Стандартная аналитика (демография)</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Стандартное промо</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Смарт-ссылки</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Финансы: 80% дохода</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>Инструментальные релизы (ФРП)</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>Аналитика по странам</span>
            </li>
            <li className="flex items-start gap-3 text-textMuted">
              <X className="w-5 h-5 text-textMuted flex-shrink-0 mt-0.5" />
              <span>Управление карточкой музыканта</span>
            </li>
          </ul>

          <a
            href="https://t.me/culturamediasup"
            target="_blank"
            rel="noreferrer"
            className="w-full block text-center py-3 rounded-xl border border-primary text-primary hover:bg-primary/10 transition-colors font-medium"
          >
            Купить
          </a>
        </div>

        {/* Premium */}
        <div className="glass p-8 rounded-3xl border border-primary/50 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
          <h2 className="text-2xl font-bold text-textMain mb-2">Премиум</h2>
          <p className="text-textMuted mb-4">Для профессионалов</p>
          <div className="text-3xl font-bold text-textMain mb-6">
            600 ₽ <span className="text-sm text-textMuted font-normal">/ месяц</span>
            <div className="text-sm text-textMuted font-normal mt-1">5000 ₽ / год</div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Отгрузка на площадки от 6 часов</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Модерация 12-24 часа</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Расширенная аналитика (+ страны)</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Ускоренное промо</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Смарт-ссылки</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Финансы: 85% дохода</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Инструментальные релизы (ФРП)*</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span>Управление карточкой музыканта</span>
            </li>
          </ul>
          <p className="text-xs text-textMuted mb-6">* При выборе ФРП/Инструментал промо-поддержка отключается.</p>

          <a
            href="https://t.me/culturamediasup"
            target="_blank"
            rel="noreferrer"
            className="w-full block text-center py-3 rounded-xl bg-primary text-white hover:bg-primaryHover transition-colors font-medium shadow-lg shadow-primary/25"
          >
            Купить
          </a>
        </div>
      </div>
    </div>
  );
}