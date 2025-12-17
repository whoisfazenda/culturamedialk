import { getNews } from "@/app/actions";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="max-w-6xl mx-auto animate-entry">
      <h1 className="text-3xl font-bold mb-8">Новости</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? (
          <div className="col-span-full text-center text-textMuted py-20 glass rounded-3xl">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Новостей пока нет</p>
          </div>
        ) : (
          news.map((item, index) => (
            <Link 
              href={`/news/${item.id}`} 
              key={item.id} 
              className="group glass rounded-3xl overflow-hidden hover:border-primary/50 transition-all block animate-entry"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item.image ? (
                <div className="relative h-48 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs text-gray-300 mb-1">{new Date(item.createdAt).toLocaleDateString()}</div>
                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                      </h3>
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full bg-surfaceHover flex items-center justify-center text-textMuted">
                  <Newspaper className="w-10 h-10" />
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}