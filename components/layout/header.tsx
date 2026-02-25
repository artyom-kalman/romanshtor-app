"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { signOut } = useAuthActions();
  const { currentUser } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Римские Шторы</h1>
          <nav className="flex items-center gap-1">
            {currentUser?.role === "admin" && (
              <Link
                href="/users"
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === "/users" && "bg-accent",
                )}
              >
                Пользователи
              </Link>
            )}
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut />
          Выйти
        </Button>
      </div>
    </header>
  );
}
