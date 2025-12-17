import { getPendingReleases } from "@/app/actions";
import Link from "next/link";
import { Eye, Calendar, User, Disc } from "lucide-react";

export default async function AdminReleases() {
  const releases = await getPendingReleases();

  return (
    <div className="p-10 max-w-7xl mx-auto animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Релизы</h1>
        <div className="text-sm text-textMuted bg-surface px-3 py-1 rounded-full border border-border">
          Всего: {releases.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {releases.length === 0 ? (
          <div className="p-20 text-center text-textMuted glass rounded-3xl border border-border">
            Нет релизов
          </div>
        ) : (
          releases.map((release) => (
            <div key={release.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 glass rounded-3xl border border-border hover:border-primary/50 transition-all group gap-4">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex-shrink-0 overflow-hidden border border-white/5">
                  {release.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted">
                      <Disc className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1">{release.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {release.mainArtist}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(release.createdAt).toLocaleDateString()}</span>
                    <span>{release.type}</span>
                    {release.artist?.tariff === 'PREMIUM' && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/20">PREMIUM</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-end md:justify-start">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  release.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                  release.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {release.status}
                </span>
                
                <Link
                  href={`/admin/release/${release.id}`}
                  className="p-3 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}