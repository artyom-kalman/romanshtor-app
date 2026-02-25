"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { UserList } from "@/components/users/user-list";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersPage() {
  const currentUser = useQuery(api.users.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (currentUser !== undefined && currentUser?.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, router]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          {currentUser === undefined ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : currentUser?.role !== "admin" ? null : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Пользователи
                </h2>
                <AddUserDialog />
              </div>
              <UserList />
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
