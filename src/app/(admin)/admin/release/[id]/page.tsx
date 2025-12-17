"use client";

import { getReleaseById, updateReleaseStatus } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Check, X, Download, FileAudio, Calendar, User, Music, Disc, Globe, AlertCircle, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ReleaseDetails({ params }: { params: { id: string } }) {
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    getReleaseById(params.id).then(data => {
      setRelease(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleAction = async () => {
    if (!release) return;
    
    if (modalType === 'approve') {
      await updateReleaseStatus(release.id, "APPROVED", inputValue, undefined); // UPC
    } else if (modalType === 'reject') {
      await updateReleaseStatus(release.id, "REJECTED", undefined, inputValue); // Reason
    }
    
    setModalType(null);
    setInputValue("");
    // Refresh data
    const updated = await getReleaseById(params.id);
    setRelease(updated);
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;
  if (!release) return <div className="p-10 text-center">Релиз не найден</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto relative">
      <Link href="/admin/dashboard" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        {/* Left Column: Cover & Actions */}
        <div className="space-y-6">
          <div className="aspect-square rounded-2xl bg-surface border border-border overflow-hidden relative shadow-lg">
            {release.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-textMuted">
                <Disc className="w-16 h-16 opacity-20" />
              </div>
            )}
          </div>
          
          {release.coverUrl && (
            <a 
              href={release.coverUrl} 
              download={`cover-${release.title}.png`}
              className="flex w-full items-center justify-center rounded-xl border border-border bg-surface p-3 text-sm font-medium hover:bg-surfaceHover transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Скачать обложку
            </a>
          )}

          <div className="space-y-3 pt-4 border-t border-border">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={() => setModalType('approve')}
            >
              <Check className="mr-2 h-4 w-4" />
              Одобрить релиз
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
              onClick={() => setModalType('reject')}
            >
              <X className="mr-2 h-4 w-4" />
              Отклонить
            </Button>
          </div>
        </div>

        {/* Right Column: Info & Tracks */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                release.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                release.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                release.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                'bg-gray-500/10 text-gray-500'
              }`}>
                {release.status}
              </span>
              <span className="text-sm text-textMuted">{release.type}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{release.title}</h1>
            <p className="text-xl text-textMuted">{release.mainArtist} {release.featArtists && `feat. ${release.featArtists}`}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center gap-2 text-textMuted mb-2 text-sm uppercase tracking-wider">
                <Calendar className="h-4 w-4" /> Дата релиза
              </div>
              <div className="font-medium text-lg">{new Date(release.releaseDate).toLocaleDateString()}</div>
            </div>
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center gap-2 text-textMuted mb-2 text-sm uppercase tracking-wider">
                <Music className="h-4 w-4" /> Жанр
              </div>
              <div className="font-medium text-lg">{release.genre}</div>
            </div>
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center gap-2 text-textMuted mb-2 text-sm uppercase tracking-wider">
                <Globe className="h-4 w-4" /> Язык / Инстр.
              </div>
              <div className="font-medium text-lg">
                {release.instrumental ? "Инструментальный" : release.language || "-"}
              </div>
            </div>
          </div>

          {/* Promo Info */}
          {release.promoRequest && (
            <div className="glass p-8 rounded-3xl">
              <h3 className="flex items-center gap-3 font-semibold text-xl mb-6 text-white">
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
          )}

          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 font-semibold flex items-center justify-between bg-white/5 backdrop-blur-md">
              <span className="text-lg">Треклист ({release.tracks.length})</span>
            </div>
            <div className="divide-y divide-white/5">
              {release.tracks.map((track: any) => (
                <div key={track.id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-textMuted">
                      {track.position}
                    </div>
                    <div>
                      <div className="font-medium text-lg flex items-center gap-3">
                        {track.title}
                        {track.version && <span className="text-sm text-textMuted px-2 py-0.5 bg-white/10 rounded-lg">{track.version}</span>}
                        {track.explicit && <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-textMuted text-[10px] font-bold uppercase text-textMuted" title="Explicit Content">E</span>}
                      </div>
                      <div className="text-sm text-textMuted mt-1.5 space-y-1">
                        <div>
                          <span className="text-white/40">Артисты:</span> {track.mainArtist || release.mainArtist} {track.featArtists && `feat. ${track.featArtists}`}
                        </div>
                        <div>
                          <span className="text-white/40">Музыка:</span> {track.composer} • <span className="text-white/40">Текст:</span> {track.lyricist || '-'}
                          {track.instrumental && <span className="ml-2 text-primary">• Instrumental</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {track.fileUrl && (
                    <a
                      href={track.fileUrl}
                      download={`${track.position} - ${track.title}.wav`}
                      className="p-3 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all text-textMuted transform hover:scale-105 active:scale-95"
                      title="Скачать WAV"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {release.comment && (
            <div className="glass p-8 rounded-3xl">
              <h3 className="font-semibold mb-4 text-textMuted uppercase tracking-wider text-sm">Комментарий от артиста</h3>
              <p className="bg-white/5 p-4 rounded-xl border border-white/5">{release.comment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">
              {modalType === 'approve' ? 'Подтверждение релиза' : 'Отклонение релиза'}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-textMuted mb-2">
                {modalType === 'approve' ? 'Введите UPC код' : 'Укажите причину отказа'}
              </label>
              {modalType === 'approve' ? (
                <Input 
                  placeholder="Пример: 123456789012" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              ) : (
                <textarea 
                  className="w-full min-h-[100px] rounded-lg border border-border bg-surfaceHover px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Опишите, что нужно исправить..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setModalType(null); setInputValue(""); }}>Отмена</Button>
              <Button 
                onClick={handleAction}
                className={modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {modalType === 'approve' ? 'Подтвердить' : 'Отклонить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}