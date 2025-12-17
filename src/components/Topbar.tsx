"use client";

import { usePathname } from "next/navigation";
import Notifications from "./Notifications";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitch from "./LanguageSwitch";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { dict } = useLanguage();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/admin")) return dict.common.adminPanel;
    switch (path) {
      case "/": return dict.common.news;
      case "/upload": return dict.common.upload;
      case "/releases": return dict.common.releases;
      case "/analytics": return dict.common.analytics;
      case "/finance": return dict.common.finance;
      case "/profile": return dict.common.profile;
      default: return dict.common.dashboard;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-8 transition-all duration-300">
      {/* Glass Background Wrapper */}
      <div className="absolute inset-0 bg-surface backdrop-blur-md border-b border-border z-0"></div>

      <div className="relative z-10 flex items-center gap-4">
        {onMenuClick && (
          <button
            className="md:hidden text-textMuted hover:text-textMain p-2 hover:bg-surfaceHover rounded-xl transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="text-2xl font-bold text-textMain tracking-tight">
          {getPageTitle(pathname)}
        </div>
      </div>
      
      <div className="relative z-10 flex items-center gap-4">
        <LanguageSwitch />
        <ThemeToggle />
        <div className="bg-surface border border-border rounded-full p-1 backdrop-blur-xl shadow-lg">
          <Notifications />
        </div>
      </div>
    </header>
  );
}