"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Главная
          </h2>
        </main>
      </div>
    </AuthGuard>
  );
}
