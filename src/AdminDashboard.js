// src/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import { toast } from "react-toastify";
import { Loader, Trash2, Users, HomeIcon, Eye, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import Pill from "./components/common/Pill";
import EmptyState from "./components/common/EmptyState";
import LoadingState from "./components/common/LoadingState";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // "listings" | "reports" | "users"

  const load = async () => {
    try {
      setLoading(true);
      const [overviewData, reportsData] = await Promise.all([
        apiFetch("/api/listings/admin/overview"),
        apiFetch("/api/listings/admin/reports").catch(() => ({ reports: [] }))
      ]);
      setData({ ...overviewData, reports: reportsData.reports });
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

  const handleToggleVerify = async (id, currentStatus) => {
    try {
      const res = await apiFetch(`/api/listings/admin/listings/${id}/verify`, { method: "PUT" });
      toast.success(res.isVerified ? "Listing Verified!" : "Verification Removed");
      setData(prev => ({
         ...prev,
         recentListings: prev.recentListings.map(l => l._id === id ? { ...l, isVerified: res.isVerified } : l)
      }));
    } catch (err) {
      toast.error(err.message || "Failed to toggle verification");
    }
  };

  const handleToggleVerifyUser = async (id, currentStatus) => {
    try {
      const res = await apiFetch(`/api/listings/admin/users/${id}/verify`, { method: "PUT" });
      toast.success(res.isVerified ? "User Verified!" : "Verification Removed");
      setData(prev => ({
         ...prev,
         recentUsers: prev.recentUsers.map(u => u._id === id ? { ...u, isVerified: res.isVerified } : u)
      }));
    } catch (err) {
      toast.error(err.message || "Failed to toggle verification");
    }
  };

  const handleResolveReport = async (id) => {
    setResolvingId(id);
    try {
      await apiFetch(`/api/listings/admin/reports/${id}/resolve`, { method: "PUT" });
      toast.success("Report marked as resolved");
      setData(prev => ({
        ...prev,
        reports: prev.reports.map(r => r._id === id ? { ...r, status: "resolved" } : r),
        totalReports: Math.max(0, prev.totalReports - 1)
      }));
    } catch (err) {
      toast.error(err.message || "Failed to resolve report");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState variant="inline" label="Loading dashboard…" />
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
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-600 uppercase">Admin</p>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all HamroGhar listings and users</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", value: data?.totalListings ?? "—", icon: <HomeIcon className="h-5 w-5 text-gold-600" /> },
            { label: "Active Listings", value: data?.activeListings ?? "—", icon: <Eye className="h-5 w-5 text-emerald-500" /> },
            { label: "Total Users", value: data?.totalUsers ?? "—", icon: <Users className="h-5 w-5 text-slate-500" /> },
            { label: "Pending Reports", value: data?.totalReports ?? "—", icon: <AlertTriangle className="h-5 w-5 text-amber-500" /> },
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
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl mb-6 w-fit gap-1">
          {["listings", "reports", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-white text-gold-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab === "listings" ? "Recent Listings" : tab === "reports" ? "Moderation Queue" : "Users Hub"}
              {tab === "reports" && data?.totalReports > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {data.totalReports}
                </span>
              )}
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
                    {["Title", "City", "Type", "Price", "Status", "Verified", "Date", "Action"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentListings || []).map((l) => (
                    <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{l.title}</td>
                      <td className="px-4 py-3 text-slate-600">{l.location?.district || l.city}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.type === "wanted" || l.type === "rent"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-blue-50 text-gold-700 border border-blue-200"
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Rs.{l.price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          l.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Pill
                          size="sm"
                          variant="success"
                          active={l.isVerified}
                          icon={l.isVerified ? <CheckCircle className="h-3.5 w-3.5" /> : undefined}
                          onClick={() => handleToggleVerify(l._id, l.isVerified)}
                          aria-label={l.isVerified ? "Remove listing verification" : "Verify listing"}
                        >
                          {l.isVerified ? "Verified" : "Unverified"}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(l._id)}
                          disabled={deletingId === l._id}
                          aria-label="Delete listing"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === l._id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.recentListings || data.recentListings.length === 0) && (
                <EmptyState icon={HomeIcon} title="No listings found" />
              )}
            </div>
          </div>
        )}

        {/* Reports Table (Moderation Queue) */}
        {activeTab === "reports" && (
          <div className="rounded-2xl bg-white border border-blue-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Listing", "Reported By", "Status", "Date", "Action"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.reports || []).map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.listingId ? (
                          <a href={`/property/${r.listingId._id}`} target="_blank" rel="noreferrer" className="text-gold-700 hover:underline flex items-center gap-1">
                            {r.listingId.title} <Eye className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Deleted Listing</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.reporterId ? (
                          <div className="flex flex-col">
                            <span className="font-semibold">{r.reporterId.name}</span>
                            <span className="text-xs text-slate-400">{r.reporterId.email}</span>
                          </div>
                        ) : "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === "resolved" || r.status === "reviewed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 flex flex-wrap items-center gap-2">
                         {r.status !== "resolved" && (
                           <button
                             onClick={() => handleResolveReport(r._id)}
                             disabled={resolvingId === r._id}
                             aria-label="Mark report resolved"
                             className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-emerald-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50"
                           >
                             {resolvingId === r._id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                             Mark Resolved
                           </button>
                         )}
                         {r.listingId && (
                           <button
                             onClick={() => handleDelete(r.listingId._id)}
                             disabled={deletingId === r.listingId._id}
                             aria-label="Delete listing"
                             className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                           >
                             {deletingId === r.listingId._id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                             Delete Listing
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.reports || data.reports.length === 0) && (
                <EmptyState icon={CheckCircle} title="All caught up!" text="There are no pending reports in the queue." />
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
                    {["Name", "Email", "Role", "Verified", "Joined", "Action"].map((h) => (
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
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isVerified
                            ? "bg-blue-50 text-gold-700 border border-blue-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {u.isVerified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Pill
                          size="sm"
                          variant="success"
                          active={u.isVerified}
                          icon={u.isVerified ? <CheckCircle className="h-3.5 w-3.5" /> : undefined}
                          onClick={() => handleToggleVerifyUser(u._id, u.isVerified)}
                          aria-label={u.isVerified ? "Remove user verification" : "Verify user"}
                        >
                          {u.isVerified ? "Verified" : "Unverified"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <EmptyState icon={Users} title="No users found" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
