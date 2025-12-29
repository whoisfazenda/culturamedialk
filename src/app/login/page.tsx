"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Music, X } from "lucide-react";
import Link from "next/link";
import { loginUser, resetPassword } from "@/app/actions";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        if (res.forcePasswordChange) {
          router.push("/profile?tab=security");
        } else {
          router.push("/");
        }
      } else {
        alert("Ошибка: " + res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await resetPassword(resetEmail);
      if (res.success) {
        alert("Новый временный пароль отправлен на вашу почту");
        setIsResetOpen(false);
      } else {
        alert("Ошибка: " + res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-10 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-white">Cultura Media</h2>
          <p className="mt-2 text-sm text-textMuted">Вход в личный кабинет артиста</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              type="password" 
              placeholder="Пароль" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
          
          <div className="flex flex-col items-center space-y-4 text-sm">
            <div>
              <span className="text-textMuted">Нет аккаунта? </span>
              <Link href="/register" className="text-primary hover:underline">
                Зарегистрироваться
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsResetOpen(true)}
              className="text-textMuted hover:text-white transition-colors"
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      </div>

      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative">
            <button
              onClick={() => setIsResetOpen(false)}
              className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Восстановление пароля</h3>
            <p className="text-textMuted mb-6">Введите ваш Email, и мы отправим вам новый временный пароль.</p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? "Отправка..." : "Отправить пароль"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}