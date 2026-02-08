"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";

export function Header() {
  const { signOut } = useAuthActions();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">Римские Шторы</h1>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut />
          Выйти
        </Button>
      </div>
    </header>
  );
}
