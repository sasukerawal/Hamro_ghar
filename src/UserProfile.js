// src/UserProfile.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "./api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowLeft,
  Save,
  Edit3,
  X,
  Share2,
  Facebook,
  Instagram,
  ExternalLink,
  KeyRound,
  Loader,
} from "lucide-react";
import LoadingState from "./components/common/LoadingState";

/* ----------------------------------------
   MOBILE HEADER
---------------------------------------- */
function MobileHeader({ onGoHome }) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10 sm:hidden shadow-md">
      <button
        onClick={onGoHome}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-gold-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <p className="text-sm font-semibold text-slate-900">Profile</p>
    </div>
  );
}

/* ----------------------------------------
   MAIN PROFILE COMPONENT
---------------------------------------- */
export default function UserProfile({ onGoHome, onLogout }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Three independent edit states
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Basic info form
  const [basicForm, setBasicForm] = useState({ name: "", phone: "", city: "" });
  const [savingBasic, setSavingBasic] = useState(false);

  // Socials form
  const [socialsForm, setSocialsForm] = useState({
    facebook: "",
    instagram: "",
    whatsapp: "",
    tiktok: "",
  });
  const [savingSocials, setSavingSocials] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch("/api/users/me");
        if (!data.user) throw new Error("User data missing");
        setUser(data.user);
        setBasicForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          city: data.user.city || "",
        });
        setSocialsForm({
          facebook: data.user.socials?.facebook || "",
          instagram: data.user.socials?.instagram || "",
          whatsapp: data.user.socials?.whatsapp || "",
          tiktok: data.user.socials?.tiktok || "",
        });
      } catch (err) {
        toast.error(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save basic info
  const saveBasic = async () => {
    if (!basicForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingBasic(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: basicForm.name, phone: basicForm.phone, city: basicForm.city }),
      });
      setUser((prev) => ({ ...prev, ...basicForm }));
      setEditingBasic(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSavingBasic(false);
    }
  };

  // Save socials
  const saveSocials = async () => {
    setSavingSocials(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socials: socialsForm }),
      });
      setUser((prev) => ({ ...prev, socials: socialsForm }));
      setEditingSocials(false);
      toast.success("Social links saved");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSavingSocials(false);
    }
  };

  // Change password
  const savePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await apiFetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err.message || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState variant="inline" label="Loading profile…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <p className="text-sm text-red-500">Profile not available.</p>
        <button onClick={onGoHome} className="text-xs text-gold-700 underline">
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
    <div className="min-h-screen bg-slate-50 pb-10">
      <MobileHeader onGoHome={onGoHome} />

      {/* Desktop back */}
      <div className="hidden sm:block max-w-xl mx-auto pt-6 px-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-gold-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>

      <div
        className={`max-w-xl mx-auto space-y-4 px-0 sm:px-4 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* ── Avatar banner ── */}
        <div className="bg-white border-x border-b sm:border sm:rounded-3xl border-slate-100 shadow-sm px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gold-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              {/* 9px was below the 11px functional-text floor for a
                  role badge that actually conveys account tier. */}
              <span className="stamp mt-1 text-gold-700 text-[11px]">
                {user.role || "member"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Section 1: Basic Info ── */}
        <ProfileSection
          title="Basic Info"
          icon={<User className="h-4 w-4 text-gold-700" />}
          isEditing={editingBasic}
          saving={savingBasic}
          onEdit={() => setEditingBasic(true)}
          onCancel={() => setEditingBasic(false)}
          onSave={saveBasic}
        >
          {editingBasic ? (
            <div className="space-y-2 mt-3">
              <TextInput
                icon={<User className="h-4 w-4 text-slate-400" />}
                label="Name"
                value={basicForm.name}
                onChange={(v) => setBasicForm((f) => ({ ...f, name: v }))}
                placeholder="Your full name"
              />
              <TextInput
                icon={<Phone className="h-4 w-4 text-slate-400" />}
                label="Phone"
                type="tel"
                value={basicForm.phone}
                onChange={(v) => setBasicForm((f) => ({ ...f, phone: v }))}
                placeholder="98XXXXXXXX"
              />
              <TextInput
                icon={<MapPin className="h-4 w-4 text-slate-400" />}
                label="City"
                value={basicForm.city}
                onChange={(v) => setBasicForm((f) => ({ ...f, city: v }))}
                placeholder="Kathmandu"
              />
            </div>
          ) : (
            <div className="space-y-1.5 mt-3">
              <InfoRow icon={<User className="h-4 w-4 text-slate-400" />} label="Name" value={user.name} />
              <InfoRow icon={<Phone className="h-4 w-4 text-slate-400" />} label="Phone" value={user.phone} />
              <InfoRow icon={<MapPin className="h-4 w-4 text-slate-400" />} label="City" value={user.city} />
              <InfoRow icon={<Mail className="h-4 w-4 text-slate-400" />} label="Email" value={user.email} />
            </div>
          )}
        </ProfileSection>

        {/* ── Section 2: Social Links ── */}
        <ProfileSection
          title="Social Links"
          icon={<Share2 className="h-4 w-4 text-gold-700" />}
          isEditing={editingSocials}
          saving={savingSocials}
          onEdit={() => setEditingSocials(true)}
          onCancel={() => setEditingSocials(false)}
          onSave={saveSocials}
          subtitle="Add your socials so renters can reach you directly."
        >
          {editingSocials ? (
            <div className="space-y-2 mt-3">
              <TextInput
                icon={<Facebook className="h-4 w-4 text-gold-700" />}
                label="Facebook"
                value={socialsForm.facebook}
                onChange={(v) => setSocialsForm((f) => ({ ...f, facebook: v }))}
                placeholder="facebook.com/username or just username"
              />
              <TextInput
                icon={<Instagram className="h-4 w-4 text-pink-500" />}
                label="Instagram"
                value={socialsForm.instagram}
                onChange={(v) => setSocialsForm((f) => ({ ...f, instagram: v }))}
                placeholder="@username"
              />
              <TextInput
                icon={<Phone className="h-4 w-4 text-green-600" />}
                label="WhatsApp"
                type="tel"
                value={socialsForm.whatsapp}
                onChange={(v) => setSocialsForm((f) => ({ ...f, whatsapp: v }))}
                placeholder="9801234567"
              />
              <TextInput
                icon={<ExternalLink className="h-4 w-4 text-slate-600" />}
                label="TikTok"
                value={socialsForm.tiktok}
                onChange={(v) => setSocialsForm((f) => ({ ...f, tiktok: v }))}
                placeholder="@username"
              />
            </div>
          ) : (
            <div className="space-y-1.5 mt-3">
              <SocialViewRow icon={<Facebook className="h-4 w-4 text-gold-700" />} label="Facebook" value={user.socials?.facebook} />
              <SocialViewRow icon={<Instagram className="h-4 w-4 text-pink-500" />} label="Instagram" value={user.socials?.instagram} />
              <SocialViewRow icon={<Phone className="h-4 w-4 text-green-600" />} label="WhatsApp" value={user.socials?.whatsapp} />
              <SocialViewRow icon={<ExternalLink className="h-4 w-4 text-slate-600" />} label="TikTok" value={user.socials?.tiktok} />
            </div>
          )}
        </ProfileSection>

        {/* ── Section 3: Password ── */}
        <div className="bg-white border-x border-b sm:border sm:rounded-3xl border-slate-100 shadow-sm px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-gold-700" />
              <p className="text-sm font-semibold text-slate-900">Password</p>
            </div>
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-700 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                Change password
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>

          {showPasswordSection && (
            <div className="mt-4 space-y-2">
              <TextInput
                icon={<Lock className="h-4 w-4 text-slate-400" />}
                label="Current password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(v) => setPasswordForm((f) => ({ ...f, currentPassword: v }))}
                placeholder="••••••••"
              />
              <TextInput
                icon={<Lock className="h-4 w-4 text-slate-400" />}
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(v) => setPasswordForm((f) => ({ ...f, newPassword: v }))}
                placeholder="At least 6 characters"
              />
              <TextInput
                icon={<Lock className="h-4 w-4 text-slate-400" />}
                label="Confirm new password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(v) => setPasswordForm((f) => ({ ...f, confirmPassword: v }))}
                placeholder="Repeat new password"
              />
              <button
                onClick={savePassword}
                disabled={savingPassword}
                className="w-full mt-1 py-2.5 bg-gold-500 text-white text-sm font-semibold rounded-xl hover:bg-gold-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingPassword && <Loader className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-4 sm:px-0">
          <button
            onClick={onLogout}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   SECTION WRAPPER with independent Edit/Save/Cancel buttons
---------------------------------------- */
function ProfileSection({ title, icon, subtitle, isEditing, saving, onEdit, onCancel, onSave, children }) {
  return (
    <div className="bg-white border-x border-b sm:border sm:rounded-3xl border-slate-100 shadow-sm px-4 py-4 sm:px-6">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm font-semibold text-slate-900">{title}</p>
          </div>
          {subtitle && !isEditing && (
            <p className="text-[11px] text-slate-500 mt-0.5 ml-6">{subtitle}</p>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gold-500 text-white border border-gold-500 rounded-full px-3 py-1.5 hover:bg-gold-600 disabled:opacity-60"
            >
              {saving ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold text-gold-700 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 shrink-0"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* Reusable text input for edit mode */
function TextInput({ icon, label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-3 py-2.5 shadow-sm">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wide">{label}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none text-slate-800 placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}

/* Info row for view mode */
function InfoRow({ icon, label, value }) {
  return (
    // No border/bg/shadow of its own — these already sit inside
    // ProfileSection's card; a full box per row was nested-card noise.
    // The parent's `space-y-1.5` plus this hairline divider does the
    // grouping instead.
    <div className="flex items-center gap-3 border-b border-slate-100 last:border-0 py-2.5 first:pt-0">
      <div className="shrink-0 text-slate-400">{icon}</div>
      <div className="flex-1 min-w-0">
        {/* Was text-[10px] (below the 11px functional-text floor) on
            slate-400 (2.6:1 on white, needs 4.5:1) */}
        <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-700 truncate">
          {/* slate-300 measured 1.5:1 on white — slate-500 clears 4.5:1
              while staying visually distinct from a real value. */}
          {value || <span className="text-slate-500 font-normal italic">Not set</span>}
        </p>
      </div>
    </div>
  );
}

/* Social view row — shows as clickable link */
function SocialViewRow({ icon, label, value }) {
  const href = value
    ? value.startsWith("http") ? value : `https://${value}`
    : null;

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 last:border-0 py-2.5 first:pt-0">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wide">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-0.5 text-sm font-semibold text-gold-700 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-slate-500 italic">Not set</p>
        )}
      </div>
    </div>
  );
}
