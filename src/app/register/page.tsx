"use client";

import { Music } from "lucide-react";
import Link from "next/link";

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-10 shadow-2xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Music className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-textMain">Регистрация закрыта</h2>
        <p className="mt-2 text-sm text-textMuted">
          В данный момент регистрация доступна только по приглашениям. 
          Пожалуйста, свяжитесь с администратором для получения доступа.
        </p>
        
        <div className="mt-8">
          <Link href="/login" className="text-primary hover:underline">
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}