"use client";

import { approvePayout, getAllPayouts, getAllFinancialReports } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Check, Plus, Wallet, FileText, Download, History, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/Select";

export default function AdminFinance() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quarterFilter, setQuarterFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const [p, r] = await Promise.all([getAllPayouts(), getAllFinancialReports()]);
      setPayouts(p);
      setReports(r);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    await approvePayout(id);
    // Refresh
    const [p, r] = await Promise.all([getAllPayouts(), getAllFinancialReports()]);
    setPayouts(p);
    setReports(r);
  };

  const filteredReports = quarterFilter === "all" 
    ? reports 
    : reports.filter(r => r.quarter === quarterFilter);

  const uniqueQuarters = Array.from(new Set(reports.map(r => r.quarter)));

  const pendingPayouts = payouts.filter(p => p.status === 'PENDING');
  const processedPayouts = payouts.filter(p => p.status === 'PAID');

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto animate-entry">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Финансы</h1>
        <Link 
          href="/admin/finance/create" 
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить отчет
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payouts Column */}
        <div className="space-y-8">
          {/* Pending Payouts */}
          <div className="glass rounded-3xl border border-border overflow-hidden h-fit">
            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md font-bold flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Wallet className="w-4 h-4" /></div>
              Заявки на вывод ({pendingPayouts.length})
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {pendingPayouts.length === 0 ? (
                <div className="p-10 text-center text-textMuted">Нет активных заявок</div>
              ) : (
                pendingPayouts.map((payout: any) => (
                  <div key={payout.id} className="p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-primary flex-shrink-0 border border-white/5">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{payout.user.name}</div>
                        <div className="text-xs text-textMuted">{payout.user.email}</div>
                        <div className="text-sm mt-1">
                          <span className="text-textMuted">Метод:</span> {payout.method === 'card' ? 'Карта' : payout.method === 'sbp' ? 'СБП' : 'ЮMoney'}
                        </div>
                        <div className="text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg mt-2 w-fit border border-white/5">{payout.details}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="text-2xl font-bold">{payout.amount.toLocaleString()} ₽</div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 rounded-xl px-4"
                        onClick={() => handleApprove(payout.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Выплачено
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Processed Payouts */}
          <div className="glass rounded-3xl border border-border overflow-hidden h-fit opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md font-bold flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success"><History className="w-4 h-4" /></div>
              Обработанные выплаты ({processedPayouts.length})
            </div>
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
              {processedPayouts.length === 0 ? (
                <div className="p-10 text-center text-textMuted">История пуста</div>
              ) : (
                processedPayouts.map((payout: any) => (
                  <div key={payout.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <div className="font-medium">{payout.user.name}</div>
                      <div className="text-xs text-textMuted mt-1">{new Date(payout.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success text-lg">-{payout.amount.toLocaleString()} ₽</div>
                      <div className="text-xs text-textMuted mt-1">{payout.method}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sent Reports */}
        <div className="glass rounded-3xl border border-border overflow-hidden h-fit">
          <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <div className="font-bold flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><FileText className="w-4 h-4" /></div>
              Отправленные отчеты
            </div>
            {uniqueQuarters.length > 0 && (
              <div className="w-48">
                <Select
                  options={[{ value: "all", label: "Все кварталы" }, ...uniqueQuarters.map(q => ({ value: q, label: q }))]}
                  value={quarterFilter}
                  onChange={setQuarterFilter}
                  className="w-full"
                />
              </div>
            )}
          </div>
          <div className="divide-y divide-white/5 max-h-[800px] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <div className="p-10 text-center text-textMuted">Нет отчетов</div>
            ) : (
              filteredReports.map((report: any) => (
                <div key={report.id} className="p-6 hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg mb-1">{report.title}</div>
                      <div className="text-xs text-textMuted flex items-center gap-2">
                        <User className="w-3 h-3" /> {report.user.name} ({report.user.email})
                      </div>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-lg text-xs text-white font-medium">
                      {report.quarter}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="font-bold text-xl text-success">+{report.amount.toLocaleString()} ₽</div>
                    {report.fileUrl && (
                      <a
                        href={report.fileUrl}
                        download
                        className="text-primary hover:text-white text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Download className="w-4 h-4" /> Скачать
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}