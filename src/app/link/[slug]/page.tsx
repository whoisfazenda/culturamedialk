import { getSmartLink } from "@/app/actions";
import { ExternalLink, Globe, Disc } from "lucide-react";
import { SpotifyIcon, AppleMusicIcon, VkMusicIcon, YandexMusicIcon, YouTubeMusicIcon } from "@/components/icons/PlatformIcons";
import Image from "next/image";

export default async function SmartLinkPage({ params }: { params: { slug: string } }) {
  const release = await getSmartLink(params.slug);

  if (!release) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ссылка не найдена</h1>
          <p className="text-gray-400">Возможно, релиз был удален или ссылка неверна.</p>
        </div>
      </div>
    );
  }

  const links = JSON.parse(release.platformLinks || "{}");

  const getPlatformIcon = (name: string) => {
    switch (name) {
      case "Spotify": return <SpotifyIcon className="w-6 h-6" />;
      case "Apple Music": return <AppleMusicIcon className="w-6 h-6" />;
      case "YouTube Music": return <YouTubeMusicIcon className="w-6 h-6" />;
      case "Yandex Music": return <YandexMusicIcon className="w-6 h-6" />;
      case "VK Music": return <VkMusicIcon className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  const getPlatformColor = (name: string) => {
    switch (name) {
      case "Spotify": return "bg-[#1DB954] hover:bg-[#1ed760]";
      case "Apple Music": return "bg-[#FA243C] hover:bg-[#fc3c53]";
      case "VK Music": return "bg-[#0077FF] hover:bg-[#0088ff]";
      case "Yandex Music": return "bg-[#FFCC00] text-black hover:bg-[#ffdd33]";
      case "YouTube Music": return "bg-[#FF0000] hover:bg-[#ff1a1a]";
      default: return "bg-white/10 hover:bg-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blur */}
      {release.coverUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${release.coverUrl})` }}
        />
      )}

      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-48 h-48 mx-auto bg-white/5 rounded-2xl shadow-2xl overflow-hidden mb-6 border border-white/10">
            {release.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <Disc className="w-16 h-16" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">{release.title}</h1>
          <p className="text-gray-300">{release.mainArtist}</p>
        </div>

        <div className="space-y-3">
          {Object.entries(links).map(([platform, url]) => {
            if (!url) return null;
            return (
              <a 
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${getPlatformColor(platform)}`}
              >
                <div className="flex items-center gap-3 font-bold">
                  {getPlatformIcon(platform)}
                  <span>{platform}</span>
                </div>
                <div className="bg-white/20 p-1.5 rounded-full">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            );
          })}
          {Object.values(links).every(l => !l) && (
            <div className="text-center text-gray-500 py-4">Ссылки скоро появятся...</div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">Powered by Cultura Media</p>
        </div>
      </div>
    </div>
  );
}