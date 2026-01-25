"use client";

import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return {
    isLoading,
    isAuthenticated,
  };
}
