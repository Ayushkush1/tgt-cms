"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { InputField } from "@/app/components/InputField";
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success("Registered successfully! You can now log in.");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.message || "Registration failed");
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
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Full Name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="w-full px-4 py-2.5  rounded-2xl font-medium"
            containerClassName=""
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 rounded-2xl font-medium"
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
            className="w-full px-4 py-2.5 rounded-2xl font-medium"
            containerClassName="mx-0"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#0B0F29] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Sign In
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
