"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { ClientList } from "@/components/clients/client-list";
import { AddClientDialog } from "@/components/clients/add-client-dialog";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Клиенты</h2>
            <AddClientDialog />
          </div>
          <ClientList />
        </main>
      </div>
    </AuthGuard>
  );
}
