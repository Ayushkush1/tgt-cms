"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { InputField } from "@/app/components/InputField";
import { SaveButton } from "@/app/components/SaveButton";
import { PageHeader } from "@/components/PageHeader";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const toastId = toast.loading("Saving profile...");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!", { id: toastId });
        if (update) await update({ name });
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Profile update failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    setIsSavingPassword(true);
    const toastId = toast.loading("Updating password...");
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        toast.success("Password updated successfully!", { id: toastId });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Password update failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="mb-8">
        <PageHeader
          title="Profile Settings"
          description="Manage your personal information and security settings."
        />
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-[#0B0F29]">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className="mt-2 font-medium"
                required
              />
              <InputField
                label="Email Address"
                name="email"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email"
                className="mt-2 font-medium"
                required
                disabled
              />
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton disabled={isSavingProfile} className="w-max" />
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-[#0B0F29]">
              Security Settings
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 font-medium"
                required
              />
              <InputField
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 font-medium"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton disabled={isSavingPassword} className="w-max" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
