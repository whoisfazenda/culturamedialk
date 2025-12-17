"use client";

import { useState } from "react";
import { updateUserTariff } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Check, Edit2, X } from "lucide-react";

export default function UserTariffEditor({ userId, initialTariff, initialPeriod }: { userId: string, initialTariff: string, initialPeriod: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tariff, setTariff] = useState(initialTariff);
  const [period, setPeriod] = useState(initialPeriod);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateUserTariff(userId, tariff, period);
    setLoading(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert("Ошибка обновления тарифа");
    }
  };

  if (!isEditing) {
    return (
      <div className="mt-6 flex items-center gap-4">
        <div className="bg-surfaceHover px-4 py-2 rounded-xl border border-border">
          <span className="text-textMuted text-xs uppercase tracking-wider block mb-1">Тариф</span>
          <div className="font-bold text-textMain flex items-center gap-2">
            {tariff === 'PREMIUM' ? (
              <span className="text-orange-500">Premium</span>
            ) : (
              <span>Basic</span>
            )}
            <span className="text-textMuted text-sm font-normal">
              / {period === 'YEARLY' ? 'Год' : 'Месяц'}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4 mr-2" />
          Изменить
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-surface p-4 rounded-2xl border border-border space-y-4 max-w-md animate-in fade-in zoom-in-95">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-textMuted uppercase">Тариф</label>
          <Select
            options={[{ value: "BASIC", label: "Базовый" }, { value: "PREMIUM", label: "Премиум" }]}
            value={tariff}
            onChange={setTariff}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-textMuted uppercase">Период</label>
          <Select
            options={[{ value: "MONTHLY", label: "Месяц" }, { value: "YEARLY", label: "Год" }]}
            value={period}
            onChange={setPeriod}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          <X className="w-4 h-4 mr-2" />
          Отмена
        </Button>
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? "Сохранение..." : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
}