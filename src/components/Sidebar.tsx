"use client";

import Link from 'next/link';
import { logoutUser } from '@/app/actions';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  Music,
  Newspaper,
  Disc,
  Upload,
  BarChart3,
  Wallet,
  User,
  LogOut,
  Wrench,
  Link as LinkIcon,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const { dict } = useLanguage();

  return (
    <aside className="h-full w-full border-r border-border bg-surface backdrop-blur-xl flex flex-col">
      <div className="flex h-20 items-center border-b border-border px-8 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Music className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-textMain tracking-tight">Cultura</span>
      </div>

      <div className="h-[calc(100vh-8rem)] overflow-y-auto py-6 px-4">
        <ul className="space-y-6">
          
          {/* Обзор */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.overview}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <BarChart3 className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.dashboard}</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Newspaper className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.news}</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Релизы */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.releases}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/upload" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Upload className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.newRelease}</span>
                </Link>
              </li>
              <li>
                <Link href="/releases" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Disc className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.catalog}</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Отчеты */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.overview}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/analytics" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Activity className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.analytics}</span>
                </Link>
              </li>
              <li>
                <Link href="/finance" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Wallet className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.finance}</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Инструменты */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.tools}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/tools/smart-links" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <LinkIcon className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.smartLinks}</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/artist-card" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <User className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.artistCard}</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Прочее */}
          <li className="mt-auto">
             <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.account}</div>
             <ul className="space-y-1">
              <li>
                <Link href="/tariffs" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Wallet className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.tariffs}</span>
                </Link>
              </li>
              <li>
                <Link href="/profile" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <User className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.profile}</span>
                </Link>
              </li>
             </ul>
          </li>

        </ul>
      </div>

      <div className="absolute bottom-0 w-full border-t border-border p-6 bg-surface backdrop-blur-xl space-y-3">
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="flex w-full items-center justify-center rounded-xl border border-border p-3 text-lg text-textMuted hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            <span>{dict.common.adminPanel}</span>
          </Link>
        )}
        <button
          onClick={() => logoutUser()}
          className="flex w-full items-center justify-center rounded-xl border border-border p-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span>{dict.common.logout}</span>
        </button>
      </div>
    </aside>
  );
}