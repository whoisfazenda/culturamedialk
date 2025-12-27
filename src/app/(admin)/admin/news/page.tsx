"use client";

import { createNews, getNews, deleteNews } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Plus, Newspaper, Image as ImageIcon, Trash2 } from "lucide-react";

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", image: "" });

  useEffect(() => {
    getNews().then(setNews);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createNews(formData);
    if (res.success) {
      setIsCreating(false);
      setFormData({ title: "", content: "", image: "" });
      getNews().then(setNews);
    } else {
      alert("Ошибка: " + res.error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData({ ...formData, image: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) return;
    const res = await deleteNews(id);
    if (res.success) {
      getNews().then(setNews);
    } else {
      alert("Ошибка при удалении: " + res.error);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Новости</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить новость
        </Button>
      </div>

      {isCreating && (
        <div className="glass p-6 rounded-3xl border border-border mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">Новая публикация</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Заголовок"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Текст новости..."
              className="w-full min-h-[150px] rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
            
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 text-primary hover:text-white transition-colors px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20">
                <ImageIcon className="w-5 h-5" />
                <span>{formData.image ? "Обложка выбрана" : "Загрузить обложку"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {formData.image && <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-white/10" />}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Отмена</Button>
              <Button type="submit">Опубликовать</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <article key={item.id} className="glass rounded-3xl border border-border overflow-hidden group hover:border-primary/50 transition-all">
            {item.image ? (
              <div className="h-48 w-full overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            ) : (
              <div className="h-48 w-full bg-white/5 flex items-center justify-center text-textMuted">
                <Newspaper className="w-10 h-10 opacity-50" />
              </div>
            )}
            <div className="p-6">
              <div className="text-xs text-textMuted mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-textMuted text-sm line-clamp-3 leading-relaxed mb-4">{item.content}</p>
              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-error hover:text-red-400 p-2 hover:bg-error/10 rounded-lg transition-all"
                  title="Удалить новость"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}