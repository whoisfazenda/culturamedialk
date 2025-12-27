import { getReleaseById } from "@/app/actions";
import { ArrowLeft, Calendar, Music, User, Download, CheckCircle, Clock, XCircle, Info, Tag, Mic, Disc, Globe, AlertCircle, Megaphone } from "lucide-react";
import Link from "next/link";

export default async function ReleasePage({ params }: { params: { id: string } }) {
  const release = await getReleaseById(params.id);

  if (!release) {
    return <div>Релиз не найден</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link href="/releases" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к релизам
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="w-full md:w-64 aspect-square flex-shrink-0 bg-surface rounded-2xl overflow-hidden border border-border shadow-2xl">
          {release.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={release.coverUrl}
              alt={release.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-textMuted bg-surfaceHover">
              <Disc className="w-16 h-16 opacity-20" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              release.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              release.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {release.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
              {release.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
              {release.status === 'PENDING' && <Clock className="w-3 h-3" />}
              {release.status === 'APPROVED' ? 'Одобрен' : release.status === 'REJECTED' ? 'Отклонен' : 'На модерации'}
            </span>
            <span className="ml-3 text-xs text-textMuted uppercase tracking-wider">Создан: {new Date(release.createdAt).toLocaleDateString()}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{release.title}</h1>
          <p className="text-xl text-textMuted mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            {release.mainArtist}
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-textMuted">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" /> Отправитель: whoisfazenda
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" /> Лейбл: Cultura Media
            </div>
            {release.upc && (
              <div className="flex items-center gap-2 text-primary font-medium">
                <Tag className="w-4 h-4" /> UPC: {release.upc}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Basic Info */}
        <div className="glass p-8 rounded-3xl">
          <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-textMain">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Info className="w-4 h-4" /></div>
            Основная информация
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Тип релиза</div>
                <div className="font-medium text-lg">{release.type}</div>
              </div>
              <div>
                <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Жанр</div>
                <div className="font-medium text-lg">{release.genre}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Язык</div>
                <div className="font-medium text-lg">{release.language || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Инструментальный</div>
                <div className="font-medium text-lg">{release.instrumental ? "Да" : "Нет"}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Версия</div>
              <div className="font-medium text-lg">{release.version || 'Оригинал'}</div>
            </div>
          </div>
        </div>

        {/* Artists */}
        <div className="glass p-8 rounded-3xl">
          <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-textMain">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Mic className="w-4 h-4" /></div>
            Исполнители
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Основной артист</div>
              <div className="font-medium text-lg">{release.mainArtist}</div>
            </div>
            <div>
              <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Дополнительные артисты</div>
              <div className="font-medium text-lg">{release.featArtists || 'Нет'}</div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="glass p-8 rounded-3xl">
          <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-textMain">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Calendar className="w-4 h-4" /></div>
            Даты
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Дата релиза</div>
              <div className="font-medium text-lg">{new Date(release.releaseDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs text-textMuted mb-1.5 uppercase tracking-wider">Как можно быстрее</div>
              <div className="font-medium text-lg">Нет</div>
            </div>
          </div>
        </div>

        {/* Promo Info */}
        {release.promoRequest ? (
          <div className="glass p-8 rounded-3xl col-span-1 md:col-span-2">
            <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-textMain">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Megaphone className="w-4 h-4" /></div>
              Заявка на промо
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-xs text-textMuted mb-2 uppercase tracking-wider">Информация о релизе</div>
                <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">{release.promoReleaseInfo}</p>
              </div>
              {release.promoArtistInfo && (
                <div>
                  <div className="text-xs text-textMuted mb-2 uppercase tracking-wider">Информация об артисте</div>
                  <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">{release.promoArtistInfo}</p>
                </div>
              )}
              {release.promoMarketingInfo && (
                <div>
                  <div className="text-xs text-textMuted mb-2 uppercase tracking-wider">Маркетинговый план</div>
                  <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">{release.promoMarketingInfo}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-3xl">
            <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-textMain">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Tag className="w-4 h-4" /></div>
              Маркетинг
            </h3>
            <div className="text-sm text-textMuted p-4 bg-white/5 rounded-xl border border-white/5">
              <p>Релиз не был отправлен на промо.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tracks */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surfaceHover/50 flex items-center gap-2 font-semibold text-lg">
          <Music className="w-5 h-5 text-primary" /> Треки
        </div>
        <div className="divide-y divide-border">
          {release.tracks.map((track: any) => (
            <div key={track.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {track.position}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {track.title}
                    {track.version && <span className="text-xs text-textMuted px-2 py-0.5 bg-surfaceHover rounded border border-border">{track.version}</span>}
                    {track.explicit && <span className="inline-flex items-center rounded border border-textMuted px-1 text-[10px] uppercase text-textMuted" title="Explicit Content">E</span>}
                  </div>
                  <div className="text-xs text-textMuted mt-1 space-y-0.5">
                    <div>
                      <span className="text-textMuted">Артисты:</span> {track.mainArtist || release.mainArtist} {track.featArtists && `feat. ${track.featArtists}`}
                    </div>
                    <div>
                      <span className="text-textMuted">Музыка:</span> {track.composer} • <span className="text-textMuted">Текст:</span> {track.lyricist || '-'}
                      {track.instrumental && <span className="ml-2 text-primary">• Instrumental</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-textMuted hidden sm:block">
                  {/* <div>Автор текста</div>
                  <div>{track.lyricist || track.composer}</div> */}
                </div>
                {track.fileUrl && (
                  <a 
                    href={track.fileUrl} 
                    download={`${track.position} - ${track.title}.wav`}
                    className="p-2 rounded-lg bg-surfaceHover hover:bg-primary hover:text-white transition-colors text-textMuted"
                    title="Скачать"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Reason */}
      {release.status === 'REJECTED' && release.rejectionReason && (
        <div className="mt-8 bg-red-500/10 rounded-2xl border border-red-500/20 p-6">
          <h3 className="flex items-center gap-2 font-bold mb-2 text-red-500">
            <AlertCircle className="w-5 h-5" /> Причина отклонения
          </h3>
          <p className="text-red-200">{release.rejectionReason}</p>
        </div>
      )}

      {/* Comment */}
      {release.comment && (
        <div className="mt-8 bg-surface rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-2 text-textMuted text-sm uppercase tracking-wider">Сообщение для модератора</h3>
          <p className="bg-surfaceHover p-4 rounded-lg border border-border">{release.comment}</p>
        </div>
      )}

    </div>
  );
}