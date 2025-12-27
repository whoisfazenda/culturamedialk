"use client";

import { useState, useMemo } from "react";
import { Users, Music, PieChart, Globe, Smartphone, BarChart3, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AnalyticsDashboard({ reports, user }: { reports: any[], user: any }) {
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const isPremium = user?.tariff === 'PREMIUM';
  const { dict } = useLanguage();

  const currentData = useMemo(() => {
    if (selectedQuarter === "all") {
      const totalStreams = reports.reduce((sum, r) => sum + r.totalStreams, 0);
      const uniqueListeners = reports.reduce((sum, r) => sum + r.uniqueListeners, 0);
      
      // Aggregate tracks
      const trackMap = new Map();
      reports.forEach(r => {
        r.trackStats.forEach((stat: any) => {
          const current = trackMap.get(stat.trackId) || { ...stat, streams: 0 };
          current.streams += stat.streams;
          trackMap.set(stat.trackId, current);
        });
      });

      // Aggregate Platforms & Countries
      const platformMap: Record<string, number> = {};
      const countryMap: Record<string, number> = {};

      reports.forEach(r => {
        const platforms = JSON.parse(r.platformStats || "{}");
        const countries = JSON.parse(r.countryStats || "{}");

        Object.entries(platforms).forEach(([k, v]) => {
          platformMap[k] = (platformMap[k] || 0) + (v as number);
        });
        Object.entries(countries).forEach(([k, v]) => {
          countryMap[k] = (countryMap[k] || 0) + (v as number);
        });
      });
      
      return {
        quarter: dict.common.allTime,
        totalStreams,
        uniqueListeners,
        trackStats: Array.from(trackMap.values()),
        platformStats: platformMap,
        countryStats: countryMap
      };
    }
    
    const report = reports.find(r => r.quarter === selectedQuarter);
    if (!report) return null;

    return {
      ...report,
      platformStats: JSON.parse(report.platformStats || "{}"),
      countryStats: JSON.parse(report.countryStats || "{}")
    };
  }, [selectedQuarter, reports]);

  const getChartData = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value], index) => ({
        key,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: ["#6200ea", "#7c4dff", "#b388ff", "#03dac6", "#018786", "#cf6679", "#b00020"][index % 7]
      }));
  };

  const getPieStyle = (data: any[]) => {
    let currentAngle = 0;
    const gradientParts = data.map((item) => {
      const angle = (item.percentage / 100) * 360;
      const start = currentAngle;
      currentAngle += angle;
      return `${item.color} ${start}deg ${currentAngle}deg`;
    });
    return { background: `conic-gradient(${gradientParts.join(", ")})` };
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{dict.common.analytics}</h1>
        
        {reports.length > 0 && (
          <select
            className="h-10 rounded-xl border border-border bg-surfaceHover px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            <option value="all">{dict.common.allTime}</option>
            {reports.map(r => (
              <option key={r.id} value={r.quarter}>{r.quarter}</option>
            ))}
          </select>
        )}
      </div>

      {!currentData ? (
        <div className="p-20 text-center text-textMuted bg-surface rounded-3xl border border-border">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{dict.common.noDataPeriod}</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-3xl border border-border flex items-center gap-6">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-textMuted mb-1">{dict.common.totalStreams}</div>
                <div className="text-3xl font-bold">{currentData.totalStreams.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-3xl border border-border flex items-center gap-6">
              <div className="h-16 w-16 bg-success/20 rounded-full flex items-center justify-center text-success">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-textMuted mb-1">{dict.common.uniqueListeners}</div>
                <div className="text-3xl font-bold">{currentData.uniqueListeners.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Platforms & Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Platforms */}
            <div className="bg-surface p-6 rounded-3xl border border-border">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" /> {dict.common.platforms}
              </h3>
              <div className="space-y-4">
                {getChartData(currentData.platformStats).map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.key}</span>
                      <span className="text-textMuted">{item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-surfaceHover rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(currentData.platformStats).length === 0 && <div className="text-textMuted text-sm">{dict.common.noData}</div>}
              </div>
            </div>

            {/* Countries */}
            <div className="bg-surface p-6 rounded-3xl border border-border relative overflow-hidden">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> {dict.common.countries}
              </h3>
              
              {!isPremium ? (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
                  <Lock className="w-8 h-8 text-primary mb-2" />
                  <h4 className="font-bold text-lg mb-1">{dict.common.availableInPremium}</h4>
                  <p className="text-sm text-textMuted mb-4">{dict.common.countryAnalyticsPremium}</p>
                  <Link href="/tariffs" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primaryHover transition-colors">
                    {dict.common.learnTariffs}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getChartData(currentData.countryStats).map((item) => (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.key}</span>
                        <span className="text-textMuted">{item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-surfaceHover rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  {Object.keys(currentData.countryStats).length === 0 && <div className="text-textMuted text-sm">{dict.common.noData}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Tracks Chart */}
          <div className="bg-surface p-8 rounded-3xl border border-border">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-primary" /> {dict.common.tracksDistribution}
            </h3>
            
            {currentData.trackStats.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-64 h-64 rounded-full shadow-2xl flex-shrink-0" style={getPieStyle(
                  currentData.trackStats.map((s: any, i: number) => {
                    const total = currentData.trackStats.reduce((sum: number, x: any) => sum + x.streams, 0);
                    return {
                      percentage: total > 0 ? (s.streams / total) * 100 : 0,
                      color: ["#6200ea", "#7c4dff", "#b388ff", "#03dac6", "#018786", "#cf6679", "#b00020"][i % 7]
                    };
                  })
                )}>
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-surface rounded-full flex items-center justify-center border border-border">
                    <span className="text-sm text-textMuted font-medium">Tracks</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {currentData.trackStats.map((stat: any, index: number) => {
                    const colors = ["#6200ea", "#7c4dff", "#b388ff", "#03dac6", "#018786", "#cf6679", "#b00020"];
                    const color = colors[index % colors.length];
                    const total = currentData.trackStats.reduce((sum: number, s: any) => sum + s.streams, 0);
                    const percentage = total > 0 ? (stat.streams / total) * 100 : 0;

                    return (
                      <div key={stat.trackId || index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="font-medium truncate max-w-[200px]">{stat.track.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white font-mono">{stat.streams.toLocaleString()}</span>
                          <span className="text-textMuted w-12 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-textMuted">{dict.common.noTrackData}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}