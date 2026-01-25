"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { signOut } = useAuthActions();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome
        </h1>
        <p className="text-muted-foreground">
          You are signed in.
        </p>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </main>
    </div>
  );
}
