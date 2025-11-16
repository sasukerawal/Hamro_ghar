// src/UserProfile.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Lock,
  ArrowLeft,
  Save,
  Edit3,
} from "lucide-react";

/* ----------------------------------------
   MOBILE-ONLY HEADER (for this page)
   On desktop, your global <Header /> is used.
---------------------------------------- */
function MobileHeader({ onGoHome, onLogout }) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10 sm:hidden">
      <button
        onClick={onGoHome}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <p className="text-sm font-semibold text-slate-900 ">Profile</p>
      
    </div>
  );
}

/* ----------------------------------------
   MAIN PROFILE COMPONENT
---------------------------------------- */

export default function UserProfile({ onGoHome, onLogout }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    profilePic: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Fade-in on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setLoading(false);
          toast.error("Unable to load profile");
          return;
        }

        const data = await res.json();
        if (!data.user) {
          setLoading(false);
          toast.error("Unable to load profile");
          return;
        }

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          city: data.user.city || "",
          profilePic: data.user.profilePic || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Save profile updates
  const updateProfile = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return;
      }

      toast.success("Profile updated");
      setEditing(false);
      setUser((prev) => (prev ? { ...prev, ...form } : prev));
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Change password
  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Fill both password fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/users/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Password change failed");
        return;
      }

      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // Simple photo change (URL-based for now)
  const handleChangePhoto = () => {
    const url = window.prompt("Paste image URL for your profile picture:");
    if (url) {
      setForm((prev) => ({ ...prev, profilePic: url }));
      toast.info("Photo set. Tap Save to update.");
    }
  };

  // While loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
        <p className="text-sm text-red-500 mb-2">Profile not available.</p>
        <button
          onClick={onGoHome}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  const initials = (user.name || "HG")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 pt-0 pb-6 sm:py-6 flex justify-center">
      <div className="w-full max-w-xl">
        {/* Mobile header (only on small screens) */}
        <MobileHeader onGoHome={onGoHome} onLogout={onLogout} />

        {/* Desktop back button */}
        <button
          onClick={onGoHome}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 mb-4 px-4 sm:px-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Profile card */}
        <div
          className={`relative rounded-none sm:rounded-3xl bg-white/80 backdrop-blur-xl border-x border-b sm:border border-blue-100 shadow-xl px-3 py-6 sm:px-6 sm:py-7 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                My Profile
              </h1>
              <p className="text-xs text-slate-500">
                Manage personal information and security
              </p>
            </div>

            {/* Edit / Save toggle button */}
            <button
              onClick={editing ? updateProfile : () => setEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shadow-sm ${
                editing
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              {editing ? (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 text-white text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-lg ring-4 ring-white">
                {form.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <button
                onClick={handleChangePhoto}
                className="absolute bottom-0 right-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition-all shadow"
              >
                <Camera className="h-4 w-4 text-blue-600" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-base sm:text-lg truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">Member since 2025</p>

              <div className="mt-2 flex items-center gap-1 bg-blue-50/70 px-3 py-1 rounded-full text-[11px] text-blue-700 w-fit max-w-full">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <Field
              icon={User}
              label="Full Name"
              editable={editing}
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Field
              icon={Phone}
              label="Phone Number"
              editable={editing}
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
            <Field
              icon={MapPin}
              label="City / Location"
              editable={editing}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <StaticField icon={Mail} label="Email (Login)" value={user.email} />

            {/* Password box */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-4 mt-5 sm:mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-blue-600" />
                <p className="font-semibold text-sm text-slate-900">
                  Update Password
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  onClick={changePassword}
                  className="w-full bg-blue-600 text-white text-xs font-semibold rounded-xl py-2 hover:bg-blue-700 transition-all shadow-md mt-1"
                >
                  Save Password
                </button>
              </div>
            </div>
          </div>

          {/* Bottom hint when editing */}
          {editing && (
            <div className="flex justify-between items-center mt-6 border-t border-blue-100 pt-4">
              <p className="text-xs text-slate-500">Don&apos;t forget to save!</p>
              <button
                type="button"
                onClick={updateProfile}
                className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-full hover:bg-emerald-600 transition-all font-semibold"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   FIELD COMPONENTS
---------------------------------------- */

function Field({ icon: Icon, label, value, editable, onChange }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
      <Icon className="h-4 w-4 text-blue-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase text-slate-500">
          {label}
        </p>

        {editable ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium outline-none border-b border-blue-100 focus:border-blue-400 text-slate-800"
          />
        ) : (
          <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
            {value || <span className="text-slate-400">Not set</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function StaticField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
      <Icon className="h-4 w-4 text-slate-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
