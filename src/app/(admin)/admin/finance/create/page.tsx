"use client";

import { createFinancialReport, getUsers } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateFinancialReport() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  
  const [formData, setFormData] = useState({
    quarter: "2-й квартал 2024",
    title: "",
    amount: "",
    fileData: "",
    linkUrl: ""
  });

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData({ ...formData, fileData: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await createFinancialReport({
      artistId: selectedUser,
      quarter: formData.quarter,
      title: formData.title || `Отчет_${formData.quarter.replace(/\s/g, '_')}`,
      amount: parseFloat(formData.amount) || 0,
      fileData: formData.fileData,
      linkUrl: formData.linkUrl
    });

    if (res.success) {
      alert("Отчет создан и баланс пополнен!");
      router.push("/admin/finance");
    } else {
      alert("Ошибка создания отчета");
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <Link href="/admin/finance" className="inline-flex items-center text-textMuted hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      <h1 className="text-3xl font-bold mb-8">Создать финансовый отчет</h1>

      <form onSubmit={handleSubmit} className="space-y-8 glass p-8 rounded-3xl border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted">Артист</label>
            <Select
              options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Выберите артиста..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted">Квартал</label>
            <Select
              options={[
                "1-й квартал 2024",
                "2-й квартал 2024",
                "3-й квартал 2024",
                "4-й квартал 2024",
                "1-й квартал 2025"
              ]}
              value={formData.quarter}
              onChange={(val) => setFormData({...formData, quarter: val})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Название отчета"
            placeholder="Автоматически если пусто"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Input
            label="Сумма (₽)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Upload className="w-4 h-4" /></div>
            Файл отчета
          </h3>
          
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group">
              <Upload className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span>{formData.fileData ? "Файл выбран" : "Загрузить PDF/Excel"}</span>
              <input type="file" accept=".pdf,.xls,.xlsx" className="hidden" onChange={handleFileUpload} />
            </label>
            <span className="text-sm text-textMuted">или</span>
            <Input
              placeholder="Ссылка на документ (Google Drive и т.д.)"
              value={formData.linkUrl}
              onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="rounded-xl">
            <Save className="mr-2 h-4 w-4" />
            Сохранить и пополнить баланс
          </Button>
        </div>
      </form>
    </div>
  );
}