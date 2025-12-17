"use client";

import { getReleaseById, updateSmartLink, searchLinks } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Globe, ExternalLink, RefreshCw, Copy, Check, Search } from "lucide-react";
import { SpotifyIcon, AppleMusicIcon, VkMusicIcon, YandexMusicIcon, YouTubeMusicIcon } from "@/components/icons/PlatformIcons";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SmartLinkEditor({ params }: { params: { id: string } }) {
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<{ [key: string]: string }>({
    "Spotify": "", "Apple Music": "", "Yandex Music": "", "VK Music": "", "YouTube Music": ""
  });
  const [isSearching, setIsSearching] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const defaultLinks = {
    "Spotify": "", "Apple Music": "", "Yandex Music": "", "VK Music": "", "YouTube Music": ""
  };

  useEffect(() => {
    getReleaseById(params.id).then(data => {
      setRelease(data);
      if (data?.platformLinks) {
        const loadedLinks = JSON.parse(data.platformLinks);
        // Merge with defaults to ensure all keys exist
        setLinks({ ...defaultLinks, ...loadedLinks });
      }
      if (data?.smartLinkSlug) {
        setGeneratedSlug(data.smartLinkSlug);
      }
      setLoading(false);
    });
  }, [params.id]);

  const handleAutoSearch = async () => {
    setIsSearching(true);
    
    try {
      const query = `${release.title} ${release.mainArtist}`;
      const results = await searchLinks(query);

      if (results) {
        const newLinks = { ...links };
        
        if (results.spotify) newLinks["Spotify"] = results.spotify.url;
        if (results.appleMusic) newLinks["Apple Music"] = results.appleMusic.url;
        if (results.yandex) newLinks["Yandex Music"] = results.yandex.url;
        if (results.youtubeMusic) newLinks["YouTube Music"] = results.youtubeMusic.url;
        
        setLinks(newLinks);
        alert("Ссылки найдены!");
      } else {
        alert("Релиз не найден. Попробуйте ввести ссылки вручную.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Ошибка при поиске ссылок");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    const res = await updateSmartLink(params.id, links);
    if (res.success) {
      setGeneratedSlug(res.slug!);
      alert("Смарт-ссылка обновлена!");
    } else {
      alert("Ошибка сохранения");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/link/${generatedSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;
  if (!release) return <div className="p-10 text-center">Релиз не найден</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-entry">
      <Link href="/tools/smart-links" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="w-32 h-32 bg-surface rounded-3xl flex-shrink-0 overflow-hidden border border-border">
          {release.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Редактор смарт-ссылки</h1>
          <p className="text-xl text-textMuted">{release.title} - {release.mainArtist}</p>
          
          {generatedSlug && (
            <div className="mt-4 flex items-center gap-2 bg-surfaceHover p-2 rounded-xl border border-primary/30">
              <Globe className="w-4 h-4 text-primary" />
              <a href={`/link/${generatedSlug}`} target="_blank" className="text-primary hover:underline text-sm font-mono truncate max-w-[200px] md:max-w-none">
                {typeof window !== 'undefined' ? window.location.host : ''}/link/{generatedSlug}
              </a>
              <button onClick={copyLink} className="ml-2 p-1 hover:bg-surface rounded text-textMuted hover:text-white">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Ссылки на площадки</h2>
          <Button variant="outline" onClick={handleAutoSearch} disabled={isSearching} className="border-primary/50 text-primary hover:bg-primary/10">
            {isSearching ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isSearching ? 'Поиск...' : 'Авто-поиск'}
          </Button>
        </div>

        <div className="space-y-4">
          {Object.keys(links).map((platform) => {
            const getIcon = (name: string) => {
              switch (name) {
                case "Spotify": return <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />;
                case "Apple Music": return <AppleMusicIcon className="w-5 h-5 text-[#FA243C]" />;
                case "YouTube Music": return <YouTubeMusicIcon className="w-5 h-5 text-[#FF0000]" />;
                case "Yandex Music": return <YandexMusicIcon className="w-5 h-5 text-[#FFCC00]" />;
                case "VK Music": return <VkMusicIcon className="w-5 h-5 text-[#0077FF]" />;
                default: return <Globe className="w-5 h-5" />;
              }
            };

            return (
              <div key={platform} className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-textMuted">
                  {getIcon(platform)}
                  {platform}
                </div>
                <div className="relative">
                  <Input
                    placeholder={`Ссылка на ${platform}`}
                    value={links[platform]}
                    onChange={(e) => setLinks({...links, [platform]: e.target.value})}
                    className="pr-10"
                  />
                  {links[platform] && (
                    <a
                      href={links[platform]}
                      target="_blank"
                      className="absolute right-3 top-3 text-textMuted hover:text-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Сохранить и создать
          </Button>
        </div>
      </div>
    </div>
  );
}