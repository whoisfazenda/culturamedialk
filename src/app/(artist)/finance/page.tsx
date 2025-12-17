"use client";

import { getCurrentUser, getFinancialReports, getPayouts, requestPayout } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Wallet, Download, ExternalLink, History, ArrowUpRight } from "lucide-react";

export default function FinancePage() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // Withdraw Form
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [bankName, setBankName] = useState(""); // New state for bank name

  const fetchData = async () => {
    const u = await getCurrentUser();
    const r = await getFinancialReports();
    const p = await getPayouts();
    setUser(u);
    setReports(r);
    setPayouts(p);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    // Minimum amount check
    if (parseFloat(amount) < 2000) {
      alert("Минимальная сумма вывода — 2000 ₽");
      return;
    }

    if (parseFloat(amount) > (user?.balance || 0)) {
      alert("Недостаточно средств");
      return;
    }

    // Format details for SBP
    let finalDetails = details;
    if (method === 'sbp') {
      if (!bankName) {
        alert("Укажите банк получателя");
        return;
      }
      finalDetails = `${details} (${bankName})`;
    }

    const res = await requestPayout({
      amount: parseFloat(amount),
      method,
      details: finalDetails
    });

    if (res.success) {
      alert("Заявка на вывод создана!");
      setIsWithdrawOpen(false);
      setAmount("");
      setDetails("");
      setBankName("");
      fetchData();
    } else {
      alert("Ошибка: " + res.error);
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-entry">
      <h1 className="text-3xl font-bold mb-8">Финансы и отчеты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Balance Card */}
        <div className="bg-surface p-8 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <div className="text-textMuted mb-2">Доступная сумма</div>
            <div className="text-4xl font-bold mb-4">{(user?.balance || 0).toLocaleString()} ₽</div>
          </div>
          <Button onClick={() => setIsWithdrawOpen(true)} className="w-fit">
            Вывод средств
          </Button>
        </div>

        {/* History Card Placeholder */}
        <div className="bg-surface p-8 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">История операций</h3>
          </div>
          <div className="space-y-4 max-h-[200px] overflow-y-auto">
            {payouts.length === 0 ? (
              <p className="text-textMuted text-sm">История пуста</p>
            ) : (
              payouts.map(p => (
                <div key={p.id} className="flex justify-between text-sm border-b border-border/50 pb-2">
                  <div>
                    <div className="font-medium">Вывод средств ({p.method === 'card' ? 'Карта' : p.method === 'sbp' ? 'СБП' : 'ЮMoney'})</div>
                    <div className="text-xs text-textMuted">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">-{p.amount} ₽</div>
                    <div className={`text-xs ${p.status === 'PAID' ? 'text-success' : 'text-yellow-500'}`}>{p.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Отчеты</h2>
        {reports.length === 0 ? (
          <div className="text-center py-10 text-textMuted bg-surface rounded-2xl border border-border">
            Нет доступных отчетов
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-surface p-6 rounded-2xl border border-border flex items-center justify-between group hover:border-primary transition-colors">
              <div>
                <h3 className="font-bold text-lg mb-1">{report.title}</h3>
                <div className="text-sm text-textMuted">{report.quarter}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="font-bold text-xl">{report.amount.toLocaleString()} ₽</div>
                <div className="flex gap-2">
                  {report.fileUrl && (
                    <a 
                      href={report.fileUrl} 
                      download 
                      className="p-2 rounded-lg bg-surfaceHover hover:bg-primary hover:text-white transition-colors"
                      title="Скачать отчет"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  {report.linkUrl && (
                    <a 
                      href={report.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surfaceHover hover:bg-primary hover:text-white transition-colors"
                      title="Открыть ссылку"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-6">Вывод средств</h3>
            
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {['card', 'sbp', 'wallet'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setDetails(""); setBankName(""); }}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      method === m 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border bg-surfaceHover text-textMuted hover:border-primary/50'
                    }`}
                  >
                    {m === 'card' ? 'Карта' : m === 'sbp' ? 'СБП' : 'ЮMoney'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <Input 
                  placeholder={method === 'card' ? 'Номер карты' : method === 'sbp' ? 'Номер телефона' : 'Номер кошелька'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
                {method === 'sbp' && (
                  <Input 
                    placeholder="Банк получателя (Сбер, Тинькофф...)" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                )}
                <Input 
                  type="number"
                  placeholder="Сумма вывода"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <div className="flex justify-between text-xs text-textMuted">
                  <span>Мин. сумма: 2000 ₽</span>
                  <span>Доступно: {user?.balance} ₽</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsWithdrawOpen(false)}>Отмена</Button>
                <Button type="submit">Отправить запрос</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}