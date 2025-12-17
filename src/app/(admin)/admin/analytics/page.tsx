import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, BarChart3, User } from "lucide-react";

const prisma = new PrismaClient();

async function getAnalyticsReports() {
  return await prisma.analyticsReport.findMany({
    include: { artist: true },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function AdminAnalytics() {
  const reports = await getAnalyticsReports();

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Аналитика</h1>
        <Link 
          href="/admin/analytics/create" 
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить отчет
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <div className="p-20 text-center text-textMuted bg-surface rounded-2xl border border-border">
            Нет отчетов
          </div>
        ) : (
          reports.map((report: any) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border hover:border-primary transition-colors group">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 bg-surfaceHover rounded-full flex items-center justify-center text-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1">{report.artist.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-textMuted">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {report.artist.email}</span>
                    <span className="bg-surfaceHover px-2 py-0.5 rounded text-xs">{report.quarter}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 text-right">
                <div>
                  <div className="text-xs text-textMuted">Прослушивания</div>
                  <div className="font-bold font-mono">{report.totalStreams.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-textMuted">Слушатели</div>
                  <div className="font-bold font-mono">{report.uniqueListeners.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}