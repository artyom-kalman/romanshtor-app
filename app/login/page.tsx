"use client";

import { LoginForm } from "@/components/auth/login-form";
import { SetupForm } from "@/components/auth/setup-form";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const hasUsers = useQuery(api.users.hasUsers);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || hasUsers === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {hasUsers ? <LoginForm /> : <SetupForm />}
    </div>
  );
}
