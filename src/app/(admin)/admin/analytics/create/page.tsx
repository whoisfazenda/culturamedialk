"use client";

import { createAnalytics, getUsers, getUserReleasesWithTracks } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Save, Disc, Globe, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateAnalyticsReport() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userReleases, setUserReleases] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    quarter: "Q4 2024",
    totalStreams: "",
    uniqueListeners: "",
  });

  const [trackStats, setTrackStats] = useState<{ [key: string]: string }>({});
  const [platformStats, setPlatformStats] = useState<{ [key: string]: string }>({
    "Spotify": "", "Apple Music": "", "VK Music": "", "Yandex Music": "", "YouTube Music": ""
  });
  const [countryStats, setCountryStats] = useState<{ [key: string]: string }>({
    "Russia": "", "USA": "", "Kazakhstan": "", "Belarus": "", "Ukraine": ""
  });

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getUserReleasesWithTracks(selectedUser).then(setUserReleases);
      setTrackStats({});
    } else {
      setUserReleases([]);
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const stats = Object.entries(trackStats).map(([trackId, streams]) => ({
      trackId,
      streams: parseInt(streams) || 0
    }));

    const platforms = Object.fromEntries(
      Object.entries(platformStats).map(([k, v]) => [k, parseInt(v) || 0])
    );

    const countries = Object.fromEntries(
      Object.entries(countryStats).map(([k, v]) => [k, parseInt(v) || 0])
    );

    const res = await createAnalytics({
      artistId: selectedUser,
      quarter: formData.quarter,
      totalStreams: parseInt(formData.totalStreams) || 0,
      uniqueListeners: parseInt(formData.uniqueListeners) || 0,
      platformStats: platforms,
      countryStats: countries,
      trackStats: stats
    });

    if (res.success) {
      alert("Отчет создан!");
      router.push("/admin/analytics");
    } else {
      alert("Ошибка создания отчета");
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <Link href="/admin/analytics" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      <h1 className="text-3xl font-bold mb-8">Создать отчет</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass p-8 rounded-3xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Артист</label>
              <Select
                options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Выберите артиста..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">Квартал</label>
              <Select
                options={[
                  "Q1 2024",
                  "Q2 2024",
                  "Q3 2024",
                  "Q4 2024",
                  "Q1 2025",
                  "Q2 2025"
                ]}
                value={formData.quarter}
                onChange={(val) => setFormData({...formData, quarter: val})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Всего прослушиваний"
              type="number"
              value={formData.totalStreams}
              onChange={(e) => setFormData({...formData, totalStreams: e.target.value})}
              required
            />
            <Input
              label="Уникальные слушатели"
              type="number"
              value={formData.uniqueListeners}
              onChange={(e) => setFormData({...formData, uniqueListeners: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-3xl border border-border space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Smartphone className="w-4 h-4" /></div>
              По площадкам
            </h3>
            <div className="space-y-3">
              {Object.keys(platformStats).map(platform => (
                <div key={platform} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-textMuted">{platform}</div>
                  <Input
                    placeholder="0"
                    type="number"
                    value={platformStats[platform]}
                    onChange={(e) => setPlatformStats({...platformStats, [platform]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-border space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Globe className="w-4 h-4" /></div>
              По странам
            </h3>
            <div className="space-y-3">
              {Object.keys(countryStats).map(country => (
                <div key={country} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-textMuted">{country}</div>
                  <Input
                    placeholder="0"
                    type="number"
                    value={countryStats[country]}
                    onChange={(e) => setCountryStats({...countryStats, [country]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedUser && userReleases.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-bold text-xl px-2">Статистика по трекам</h3>
            
            {userReleases.map(release => (
              <div key={release.id} className="glass rounded-3xl border border-border overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/5">
                    {release.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="w-6 h-6 text-textMuted" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{release.title}</div>
                    <div className="text-xs text-textMuted mt-0.5">{new Date(release.releaseDate).toLocaleDateString()} • {release.type}</div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {release.tracks.map((track: any) => (
                    <div key={track.id} className="flex items-center gap-4">
                      <div className="w-6 text-center text-sm text-textMuted">{track.position}</div>
                      <div className="flex-1 text-sm font-medium truncate">
                        {track.title}
                        {track.version && <span className="text-textMuted ml-1">({track.version})</span>}
                      </div>
                      <Input
                        className="w-40"
                        placeholder="Прослушивания"
                        type="number"
                        value={trackStats[track.id] || ""}
                        onChange={(e) => setTrackStats({...trackStats, [track.id]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && userReleases.length === 0 && (
           <div className="p-10 text-center text-textMuted glass rounded-3xl border border-border">
             У этого артиста нет релизов
           </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="rounded-xl">
            <Save className="mr-2 h-4 w-4" />
            Сохранить отчет
          </Button>
        </div>
      </form>
    </div>
  );
}