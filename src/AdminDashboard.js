// src/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import { toast } from "react-toastify";
import { Loader, Trash2, Users, HomeIcon, Eye, Shield } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // "listings" | "users"

  const load = async () => {
    try {
      setLoading(true);
      const d = await apiFetch("/api/listings/admin/overview");
      setData(d);
    } catch (err) {
      setError(err.message || "Admin access required");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/listings/admin/listings/${id}`, { method: "DELETE" });
      toast.success("Listing deleted");
      setData((prev) => ({
        ...prev,
        recentListings: prev.recentListings.filter((l) => l._id !== id),
        totalListings: prev.totalListings - 1,
      }));
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-700">Access Denied</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all HamroGhar listings and users</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Listings", value: data?.totalListings ?? "—", icon: <HomeIcon className="h-5 w-5 text-blue-500" /> },
            { label: "Active Listings", value: data?.activeListings ?? "—", icon: <Eye className="h-5 w-5 text-green-500" /> },
            { label: "Total Users", value: data?.totalUsers ?? "—", icon: <Users className="h-5 w-5 text-purple-500" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-blue-50 shadow-sm p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          {["listings", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "listings" ? "Recent Listings" : "Recent Users"}
            </button>
          ))}
        </div>

        {/* Listings Table */}
        {activeTab === "listings" && (
          <div className="rounded-2xl bg-white border border-blue-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Title", "City", "Type", "Price", "Status", "Date", "Action"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentListings || []).map((l) => (
                    <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{l.title}</td>
                      <td className="px-4 py-3 text-slate-600">{l.city}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.type === "wanted"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Rs.{l.price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.status === "active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(l._id)}
                          disabled={deletingId === l._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-[11px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === l._id ? <Loader className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.recentListings || data.recentListings.length === 0) && (
                <p className="text-center text-sm text-slate-400 py-8">No listings found</p>
              )}
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === "users" && (
          <div className="rounded-2xl bg-white border border-blue-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Name", "Email", "Role", "Joined"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentUsers || []).map((u) => (
                    <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === "admin"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <p className="text-center text-sm text-slate-400 py-8">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
