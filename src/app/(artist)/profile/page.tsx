"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Lock, Camera, Mail, Save } from "lucide-react";
import { getCurrentUser, updateProfile, changePassword } from "@/app/actions";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setName(u.name);
        setBio(u.bio || "");
        setAvatarPreview(u.avatarUrl);
      }
      setLoading(false);
    });
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
        setAvatarData(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ name, bio, avatarData: avatarData || undefined });
    if (res.success) {
      alert("Профиль обновлен!");
    } else {
      alert("Ошибка обновления");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    const res = await changePassword({ currentPassword, newPassword });
    if (res.success) {
      alert("Пароль изменен!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert("Ошибка: " + res.error);
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-entry">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>

      <div className="flex gap-6 mb-8 border-b border-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'general' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-textMain'}`}
        >
          Основное
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'security' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-textMain'}`}
        >
          Безопасность
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="bg-surface p-8 rounded-2xl border border-border animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-surfaceHover border-2 border-border group-hover:border-primary transition-colors">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted">
                      <User className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primaryHover transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-textMain">{user?.name}</h2>
                  {user?.tariff === 'PREMIUM' && (
                    <span className="bg-gradient-to-r from-[#7c3aed] to-[#000000] text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-textMuted text-sm">{user?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Имя / Никнейм</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-textMuted" />
                  <Input 
                    className="pl-10" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-textMuted" />
                  <Input
                    className="pl-10 opacity-50 cursor-not-allowed"
                    value={user?.email}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-textMuted">О себе</label>
              <textarea
                className="w-full min-h-[120px] rounded-lg border border-border bg-surfaceHover px-3 py-2 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-textMuted"
                placeholder="Расскажите о своем творчестве..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Сохранить изменения
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-surface p-8 rounded-2xl border border-border animate-in fade-in slide-in-from-top-2 max-w-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Смена пароля
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <Input 
              type="password"
              label="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input 
              type="password"
              label="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input 
              type="password"
              label="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <Button type="submit" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Обновить пароль
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}