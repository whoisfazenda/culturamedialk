"use client";

import { useState, useEffect } from "react";
import { createArtistRequest, getArtistRequests, getCurrentUser } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Save, CheckCircle2, Clock, CheckCircle, XCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

const TOPICS = [
  "Изменить информацию в карточке музыканта",
  "Перенос релиза в другую карточку музыканта",
  "Отозвать релиз с площадок"
];

const PLATFORMS = [
  "Apple Music",
  "VK Музыка",
  "Яндекс Музыка",
  "Spotify",
  "Звук (бывший СберЗвук)"
];

export default function ArtistCardPage() {
  const { dict } = useLanguage();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState("");
  const [artistCardLink, setArtistCardLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(true); // Default true to avoid flash, check in useEffect

  useEffect(() => {
    getCurrentUser().then(u => setIsPremium(u?.tariff === 'PREMIUM'));
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await getArtistRequests();
    setRequests(data);
  };

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto pb-20 animate-entry">
        <Link href="/tools" className="inline-flex items-center text-textMuted hover:text-textMain mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Link>
        <div className="glass p-12 rounded-3xl text-center border border-border">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-textMain">Доступно в Premium</h1>
          <p className="text-textMuted mb-8 max-w-lg mx-auto">
            Управление карточкой музыканта, перенос релизов и отзыв контента доступны только пользователям с тарифом Премиум.
          </p>
          <Link href="/tariffs" className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-white font-medium hover:bg-primaryHover transition-all shadow-lg shadow-primary/25">
            Перейти на Премиум
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !description || !artistCardLink) {
      alert("Заполните обязательные поля (Тема, Описание, Ссылка на карточку)");
      return;
    }

    setLoading(true);
    const res = await createArtistRequest({
      type: topic,
      platform: platform || undefined,
      description,
      attachmentUrl: attachment || undefined,
      artistCardLink: artistCardLink || undefined
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTopic("");
      setPlatform("");
      setDescription("");
      setAttachment("");
      setArtistCardLink("");
      loadRequests();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Ошибка отправки запроса");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-entry">
      <Link href="/tools" className="inline-flex items-center text-textMuted hover:text-textMain mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-textMain">Взаимодействие с карточкой музыканта</h1>
      <p className="text-textMuted mb-8">Отправить запрос на изменение информации или перенос релизов.</p>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6 mb-12">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Тема запроса *</label>
          <Select
            options={TOPICS}
            value={topic}
            onChange={setTopic}
            placeholder="Выберите тему"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Площадка *</label>
          <Select
            options={PLATFORMS}
            value={platform}
            onChange={setPlatform}
            placeholder="Выберите площадку"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Описание *</label>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-border bg-surfaceHover px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary transition-all focus:bg-surface placeholder:text-textMuted"
            placeholder="Опишите детально, что нужно сделать..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Ссылка на карточку музыканта *</label>
          <Input
            placeholder="https://music.apple.com/artist/..."
            value={artistCardLink}
            onChange={(e) => setArtistCardLink(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Вложения (ссылка на фото/документы)</label>
          <Input
            placeholder="Google Drive / Yandex Disk..."
            value={attachment}
            onChange={(e) => setAttachment(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          {success && (
            <div className="flex items-center text-success text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Запрос отправлен!
            </div>
          )}
          <Button type="submit" disabled={loading} size="lg" className="rounded-xl">
            {loading ? "Отправка..." : "Отправить запрос"}
          </Button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-6 text-textMain">Мои запросы</h2>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-textMuted glass rounded-2xl">Нет активных запросов</div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="glass p-6 rounded-2xl border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-textMain mb-1">{req.type}</h3>
                  <div className="text-sm text-textMuted">{req.platform || "Все площадки"}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  req.status === 'DONE' ? 'bg-success/20 text-success' :
                  req.status === 'REJECTED' ? 'bg-error/20 text-error' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {req.status === 'DONE' && <CheckCircle className="w-3 h-3" />}
                  {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                  {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                  {req.status === 'DONE' ? 'Выполнено' : req.status === 'REJECTED' ? 'Отклонено' : 'В обработке'}
                </span>
              </div>
              <p className="text-sm text-textMain bg-surfaceHover p-4 rounded-xl border border-border mb-4">{req.description}</p>
              <div className="text-xs text-textMuted flex gap-4">
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                {req.artistCardLink && <a href={req.artistCardLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Карточка артиста</a>}
                {req.attachmentUrl && <a href={req.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Вложение</a>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}