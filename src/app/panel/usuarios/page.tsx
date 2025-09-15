"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreateUserForm from "@/app/components/CreateUserForm";

export default function UsersPanel() {
  const { user, role, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady) {
      if (!user) {
        router.push("/login");
      } else if (role !== "master") {
        router.push("/panel");
      }
    }
  }, [isAuthReady, user, role, router]);

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }

  if (!user || role !== "master") {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <CreateUserForm />
    </div>
  );
}
