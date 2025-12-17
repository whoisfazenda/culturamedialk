"use client";

import { createUserByAdmin } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Save, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", tariff: "BASIC", tariffPeriod: "MONTHLY" });
  const [createdUser, setCreatedUser] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createUserByAdmin(formData);
    if (res.success && res.user && res.password) {
      setCreatedUser({ email: res.user.email, password: res.password });
    } else {
      alert("Ошибка: " + res.error);
    }
  };

  const copyToClipboard = () => {
    if (createdUser) {
      const text = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto animate-entry">
      <Link href="/admin/users" className="inline-flex items-center text-textMuted hover:text-textMain mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-textMain">Добавить пользователя</h1>

      {!createdUser ? (
        <form onSubmit={handleSubmit} className="space-y-8 glass p-8 rounded-3xl border border-border">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Имя / Никнейм"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Тариф</label>
                <Select
                  options={[{ value: "BASIC", label: "Базовый" }, { value: "PREMIUM", label: "Премиум" }]}
                  value={formData.tariff}
                  onChange={(val) => setFormData({...formData, tariff: val})}
                  placeholder="Выберите тариф"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Период</label>
                <Select
                  options={[{ value: "MONTHLY", label: "Месяц" }, { value: "YEARLY", label: "Год" }]}
                  value={formData.tariffPeriod}
                  onChange={(val) => setFormData({...formData, tariffPeriod: val})}
                  placeholder="Выберите период"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="rounded-xl">
              <Save className="mr-2 h-4 w-4" />
              Создать пользователя
            </Button>
          </div>
        </form>
      ) : (
        <div className="glass p-8 rounded-3xl border border-border space-y-6 text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-textMain">Пользователь создан!</h2>
          <p className="text-textMuted">Сохраните эти данные и отправьте пользователю.</p>
          
          <div className="bg-surfaceHover p-6 rounded-xl border border-border text-left space-y-4">
            <div>
              <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Email</div>
              <div className="text-lg font-mono text-textMain">{createdUser.email}</div>
            </div>
            <div>
              <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Пароль</div>
              <div className="text-lg font-mono text-textMain">{createdUser.password}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={copyToClipboard} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Скопировано" : "Копировать"}
            </Button>
            <Button onClick={() => router.push("/admin/users")}>
              Вернуться к списку
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}