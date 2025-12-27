"use client";

import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  Music,
  Newspaper,
  Disc,
  LogOut,
  ShieldCheck,
  Users,
  BarChart3,
  Wallet,
  ArrowLeft
} from 'lucide-react';

export default function AdminSidebar() {
  const { dict } = useLanguage();

  return (
    <aside className="h-full w-full border-r border-border bg-surface backdrop-blur-xl flex flex-col">
      <div className="flex h-32 items-center justify-center border-b border-border px-4 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="h-auto w-full max-h-28 object-contain" onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }} />
        <div className="hidden flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Admin Panel</span>
        </div>
      </div>

      <div className="h-[calc(100vh-10rem)] overflow-y-auto py-6 px-4">
        <ul className="space-y-6">
          
          {/* Main */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.overview}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Disc className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.releases}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/news" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Newspaper className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.news}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Users className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.users}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/requests" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <ShieldCheck className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.requests}</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Finance & Analytics */}
          <li>
            <div className="text-sm font-bold text-textMuted uppercase tracking-wider px-4 mb-2">{dict.common.analytics}</div>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/analytics" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <BarChart3 className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.analytics}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/finance" className="flex items-center px-4 py-3 text-lg text-textMuted hover:bg-surfaceHover hover:text-textMain rounded-xl transition-all group">
                  <Wallet className="mr-3 h-6 w-6 group-hover:text-primary transition-colors" />
                  <span>{dict.common.finance}</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="absolute bottom-0 w-full border-t border-border p-6 bg-surface backdrop-blur-xl flex flex-col gap-3">
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-xl border border-border p-3 text-sm text-textMuted hover:bg-surfaceHover hover:text-textMain transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{dict.common.backToProfile}</span>
        </Link>
        <button className="flex w-full items-center justify-center rounded-xl border border-border p-3 text-sm text-textMuted hover:bg-surfaceHover hover:text-red-400 hover:border-red-500/30 transition-all">
          <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{dict.common.logout}</span>
        </button>
      </div>
    </aside>
  );
}