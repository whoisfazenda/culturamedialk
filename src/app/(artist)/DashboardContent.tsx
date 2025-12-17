"use client";

import Link from "next/link";
import { Newspaper, ArrowRight, Disc, DollarSign, Activity, Upload, Zap, HelpCircle } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

export default function DashboardContent({ news, releases, user }: { news: any[], releases: any[], user: any }) {
  const { dict } = useLanguage();
  const totalStreams = 0; // Placeholder
  const pendingReleases = releases.filter(r => r.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-entry">
      
      {/* Welcome & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/analytics" className="glass p-8 rounded-3xl flex flex-col justify-between h-48 relative overflow-hidden group hover:border-primary/50 transition-colors lg:col-span-1 cursor-pointer">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors"></div>
          <div className="flex items-center gap-3 text-textMuted">
            <Activity className="w-6 h-6 group-hover:text-primary transition-colors" />
            <span className="text-base font-medium group-hover:text-textMain transition-colors">{dict.common.streams}</span>
          </div>
          <div>
            <div className="text-5xl font-bold text-textMain tracking-tight">{totalStreams}</div>
            <div className="text-sm text-textMuted mt-2">{dict.common.allTime}</div>
          </div>
        </Link>

        <Link href="/finance" className="glass p-8 rounded-3xl flex flex-col justify-between h-48 relative overflow-hidden group hover:border-green-500/50 transition-colors cursor-pointer">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors"></div>
          <div className="flex items-center gap-3 text-textMuted">
            <DollarSign className="w-6 h-6 group-hover:text-green-400 transition-colors" />
            <span className="text-base font-medium group-hover:text-textMain transition-colors">{dict.common.balance}</span>
          </div>
          <div>
            <div className="text-4xl font-bold text-textMain">{(user?.balance || 0).toLocaleString()} ₽</div>
            <div className="text-sm text-green-400 hover:text-green-300 mt-2 inline-flex items-center font-medium">
              {dict.common.withdraw} <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/releases" className="glass p-8 rounded-3xl flex flex-col justify-between h-48 relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors"></div>
          <div className="flex items-center gap-3 text-textMuted">
            <Disc className="w-6 h-6 group-hover:text-blue-400 transition-colors" />
            <span className="text-base font-medium group-hover:text-textMain transition-colors">{dict.common.releases}</span>
          </div>
          <div>
            <div className="text-4xl font-bold text-textMain">{releases.length}</div>
            <div className="text-sm text-textMuted mt-2">{pendingReleases} {dict.common.onModeration}</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/upload" className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-surfaceHover transition-all group">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-textMain">{dict.common.upload}</div>
            <div className="text-xs text-textMuted">{dict.common.distribution}</div>
          </div>
        </Link>
        <Link href="/tools/smart-links" className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-surfaceHover transition-all group">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-textMain">{dict.common.smartLinks}</div>
            <div className="text-xs text-textMuted">{dict.common.promotion}</div>
          </div>
        </Link>
        <Link href="/tools/artist-card" className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-surfaceHover transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-textMain">{dict.common.artistCard}</div>
            <div className="text-xs text-textMuted">Управление карточкой</div>
          </div>
        </Link>
      </div>

      {/* Recent News */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-textMain">{dict.common.recentNews}</h2>
          <Link href="/news" className="text-sm text-primary hover:text-textMain transition-colors">
            {dict.common.allNews} &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.slice(0, 3).map((item, index) => (
            <Link
              href={`/news/${item.id}`}
              key={item.id}
              className="group glass rounded-3xl overflow-hidden hover:border-primary/50 transition-all block animate-entry"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item.image ? (
                <div className="relative h-40 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs text-gray-400 mb-1">{new Date(item.createdAt).toLocaleDateString()}</div>
                      <h3 className="text-base font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                      </h3>
                  </div>
                </div>
              ) : (
                <div className="h-40 w-full bg-surfaceHover flex items-center justify-center text-textMuted">
                  <Newspaper className="w-8 h-8" />
                </div>
              )}
            </Link>
          ))}
          {news.length === 0 && (
            <div className="col-span-full text-center text-textMuted py-8 glass rounded-3xl">{dict.common.noNews}</div>
          )}
        </div>
      </div>
    </div>
  );
}