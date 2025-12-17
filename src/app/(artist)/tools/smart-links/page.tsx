import { getArtistReleases } from "@/app/actions";
import Link from "next/link";
import { Disc, Link as LinkIcon, ExternalLink } from "lucide-react";

export default async function SmartLinksList() {
  const releases = await getArtistReleases();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Смарт-ссылки</h1>
      <p className="text-textMuted mb-8">Выберите релиз, чтобы создать или отредактировать смарт-ссылку.</p>

      {releases.length === 0 ? (
        <div className="text-center py-20 text-textMuted bg-surface rounded-2xl border border-border">
          <Disc className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>У вас пока нет релизов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases.map((release: any) => (
            <Link 
              key={release.id} 
              href={`/tools/smart-links/${release.id}`}
              className="group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary transition-all block"
            >
              <div className="flex items-center p-4 gap-4">
                <div className="h-16 w-16 bg-surfaceHover rounded-xl flex-shrink-0 overflow-hidden">
                  {release.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted">
                      <Disc className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate group-hover:text-primary transition-colors">{release.title}</h3>
                  <p className="text-sm text-textMuted truncate">{release.mainArtist}</p>
                </div>
                <div className="text-textMuted group-hover:text-primary">
                  <LinkIcon className="w-5 h-5" />
                </div>
              </div>
              
              {release.smartLinkSlug && (
                <div className="bg-surfaceHover px-4 py-2 text-xs text-primary flex items-center justify-between">
                  <span className="truncate">cultura.media/link/{release.smartLinkSlug}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}