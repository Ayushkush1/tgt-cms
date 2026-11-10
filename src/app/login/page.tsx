"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { InputField } from "@/app/components/InputField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] font-sans">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-[#0B0F29]">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to manage your CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            className="w-full rounded-2xl px-4 py-2.5 font-medium"
            containerClassName="mx-0"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-2xl px-4 py-2.5 font-medium"
            containerClassName="mx-0"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#0B0F29] py-4 font-bold tracking-widest text-white uppercase shadow-lg shadow-black/10 transition-all hover:bg-black disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#D4AF37] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Volta Studio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
