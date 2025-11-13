// src/UserProfile.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { User, Mail, Phone, MapPin, Camera, Lock } from "lucide-react";

export default function UserProfile({ onGoHome }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    profilePic: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });

  // Load profile on page load
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/me", {
          credentials: "include"
        });
        const data = await res.json();
        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          city: data.user.city || "",
          profilePic: data.user.profilePic || ""
        });
      } catch (err) {
        toast.error("Unable to load profile");
      }
    };

    loadProfile();
  }, []);

  // Update profile
  const updateProfile = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success("Profile updated!");
        setEditing(false);
      } else toast.error("Update failed");
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Update password
  const changePassword = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated!");
        setPasswordForm({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(data.error || "Password change failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  if (!user) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Profile picture */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={
            form.profilePic ||
            "https://placehold.co/100x100/blue/white?text=HG"
          }
          alt="avatar"
          className="h-20 w-20 rounded-full border border-blue-300"
        />
        <div>
          <label className="text-sm text-blue-700 flex items-center gap-1 cursor-pointer">
            <Camera className="h-4 w-4" />
            Change Photo
            <input
              type="text"
              placeholder="Enter image URL"
              className="border ml-2 p-1 text-xs rounded"
              value={form.profilePic}
              onChange={(e) =>
                setForm({ ...form, profilePic: e.target.value })
              }
            />
          </label>
        </div>
      </div>

      {/* Profile fields */}
      <div className="space-y-4">
        <Field
          label="Full Name"
          value={form.name}
          Icon={User}
          editable={editing}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <Field
          label="Email"
          value={user.email}
          Icon={Mail}
          editable={false}
        />

        <Field
          label="Phone"
          value={form.phone}
          Icon={Phone}
          editable={editing}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <Field
          label="City"
          value={form.city}
          Icon={MapPin}
          editable={editing}
          onChange={(v) => setForm({ ...form, city: v })}
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={updateProfile}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        )}

        <button
          onClick={onGoHome}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      {/* Password Section */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Change Password
        </h2>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            className="border w-full p-2 rounded"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            className="border w-full p-2 rounded"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value
              })
            }
          />

          <button
            onClick={changePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, Icon, editable, onChange }) {
  return (
    <div className="flex items-center gap-2 border p-2 rounded bg-white">
      <Icon className="h-4 w-4 text-blue-600" />
      {editable ? (
        <input
          type="text"
          className="flex-1 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm flex-1">{value || "Not set"}</p>
      )}
    </div>
  );
}
