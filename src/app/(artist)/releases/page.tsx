"use client";

import { getArtistReleases } from "@/app/actions";
import Link from "next/link";
import { Calendar, Disc } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useEffect, useState } from "react";

export default function MyReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const { dict } = useLanguage();

  useEffect(() => {
    getArtistReleases().then(setReleases);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{dict.common.myReleases}</h1>
        <Link href="/upload" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors">
          + {dict.common.newRelease}
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-20 text-textMuted bg-surface rounded-3xl border border-border animate-entry">
          <Disc className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{dict.common.noReleases}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {releases.map((release, index) => (
            <Link
              key={release.id}
              href={`/releases/${release.id}`}
              className="group bg-surface backdrop-blur-md rounded-3xl overflow-hidden border border-border transition-all hover:border-primary hover:-translate-y-1 block animate-entry"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square bg-surfaceHover relative">
                {release.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={release.coverUrl}
                    alt={release.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image load error:", release.coverUrl);
                      e.currentTarget.src = "https://via.placeholder.com/300?text=No+Cover";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-textMuted">
                    <Disc className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold shadow-md ${
                    release.status === 'APPROVED' ? 'bg-green-500 text-white' :
                    release.status === 'REJECTED' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {release.status === 'APPROVED' ? dict.common.approved : release.status === 'REJECTED' ? dict.common.rejected : dict.common.pending}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">{release.title}</h3>
                <p className="text-sm text-textMuted mb-3 truncate">{release.mainArtist}</p>
                <div className="flex items-center gap-2 text-xs text-textMuted">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}