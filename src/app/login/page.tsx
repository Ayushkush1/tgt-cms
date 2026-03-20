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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B0F29] mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">Sign in to manage your CMS</p>
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
            className="w-full px-4 py-2.5  rounded-2xl font-medium"
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
            className="w-full px-4 py-2.5  rounded-2xl font-medium"
            containerClassName="mx-0"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#0B0F29] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Volta Studio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
