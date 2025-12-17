import { getNewsById } from "@/app/actions";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";
import Link from "next/link";

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const news = await getNewsById(params.id);

  if (!news) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
        <Link href="/" className="text-primary hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link href="/" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к новостям
      </Link>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {news.image ? (
          <div className="w-full h-64 md:h-96 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 bg-surfaceHover flex items-center justify-center text-textMuted">
            <Newspaper className="w-16 h-16 opacity-20" />
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-2 text-textMuted text-sm mb-4">
            <Calendar className="w-4 h-4" />
            <span>{new Date(news.createdAt).toLocaleDateString()}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{news.title}</h1>
          
          <div className="prose prose-invert max-w-none text-textMuted leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>
        </div>
      </div>
    </div>
  );
}