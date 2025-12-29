"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Music } from "lucide-react";
import Link from "next/link";
import { loginUser } from "@/app/actions";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginUser({ email, password });
    if (res.success) {
      router.push("/");
    } else {
      alert("Ошибка: " + res.error);
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

          <Button type="submit" className="w-full h-12 text-lg">
            Войти
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-textMuted">Нет аккаунта? </span>
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}