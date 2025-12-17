import { getUserById } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, Disc, Eye } from "lucide-react";
import UserTariffEditor from "./UserTariffEditor";

export default async function AdminUserDetails({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id);

  if (!user) {
    return <div className="p-10 text-center">Пользователь не найден</div>;
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      {/* User Header */}
      <div className="glass rounded-3xl border border-border p-10 mb-10 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="w-40 h-40 rounded-full overflow-hidden bg-white/5 border-4 border-white/10 flex-shrink-0 shadow-2xl">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-textMuted">
              <User className="w-16 h-16 opacity-50" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-mono font-bold border border-primary/20">#{user.publicId}</span>
          </div>
          
          <div className="space-y-3 text-textMuted text-lg">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Mail className="w-5 h-5" /> {user.email}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Calendar className="w-5 h-5" /> Регистрация: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          {user.bio && (
            <div className="mt-8 p-6 bg-white/5 rounded-2xl text-sm border border-white/5 text-left leading-relaxed">
              <h3 className="font-bold mb-2 text-white uppercase tracking-wider text-xs">О себе</h3>
              <p>{user.bio}</p>
            </div>
          )}

          <UserTariffEditor
            userId={user.id}
            initialTariff={user.tariff}
            initialPeriod={user.tariffPeriod || "MONTHLY"}
          />
        </div>
      </div>

      {/* Releases */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Disc className="w-6 h-6 text-primary" />
        Релизы ({user.releases.length})
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {user.releases.length === 0 ? (
          <div className="p-10 text-center text-textMuted glass rounded-3xl border border-border">
            Нет загруженных релизов
          </div>
        ) : (
          user.releases.map((release: any) => (
            <div key={release.id} className="flex items-center justify-between p-6 glass rounded-3xl border border-border hover:border-primary/50 transition-all group">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-white/5 rounded-2xl flex-shrink-0 overflow-hidden border border-white/5 shadow-lg">
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
                  <h3 className="font-bold text-xl mb-1">{release.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-textMuted">
                    <span>{new Date(release.createdAt).toLocaleDateString()}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded-lg">{release.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  release.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                  release.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
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