"use client";

import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login"); // توجيه لصفحة تسجيل الدخول
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="p-10 text-center text-xl">Loading...</div>;
  }

  if (!user) return null;

  return <>{children}</>;
}
