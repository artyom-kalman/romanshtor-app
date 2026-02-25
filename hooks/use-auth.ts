"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : "skip",
  );

  return {
    isLoading,
    isAuthenticated,
    currentUser,
  };
}
