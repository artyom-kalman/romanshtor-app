"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { DocumentList } from "@/components/documents/document-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Документы
            </h2>
            <Button asChild>
              <Link href="/documents/new">
                <Plus className="mr-1 h-4 w-4" />
                Новый документ
              </Link>
            </Button>
          </div>
          <DocumentList />
        </main>
      </div>
    </AuthGuard>
  );
}
