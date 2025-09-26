"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserList from "@/app/components/UserList";

export default function UsersPanel() {
  const { user, role, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady) {
      if (!user) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/panel");
      }
    }
  }, [isAuthReady, user, role, router]);

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }

  if (!user || role !== "admin") {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        <UserList />
      </div>
    </div>
  );
}
