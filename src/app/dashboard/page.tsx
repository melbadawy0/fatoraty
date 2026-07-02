"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { Download, FileText, TrendingUp, Calendar } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber?: string;
  date?: string;
  vendor?: string;
  total?: number;
  currency?: string;
  category?: string;
  createdAt?: Timestamp | Date | { seconds: number; nanoseconds: number } | any;
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate && typeof value.toDate === "function") return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return null;
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("demo-user");

  useEffect(() => {
    loadInvoices();
  }, [userId]);

  async function loadInvoices() {
    try {
      const invoicesRef = collection(db, "invoices");
      const q = query(
        invoicesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
      setInvoices(data);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const thisMonth = invoices.filter((inv) => {
    const d = toDate(inv.createdAt);
    if (!d) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const byCategory: Record<string, number> = {};
  invoices.forEach((inv) => {
    const cat = inv.category || "other";
    byCategory[cat] = (byCategory[cat] || 0) + (inv.total || 0);
  });

  function downloadExcel() {
    const headers = ["Invoice #", "Date", "Vendor", "Category", "Total", "Currency"];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber || "",
      inv.date || "",
      inv.vendor || "",
      inv.category || "",
      inv.total || 0,
      inv.currency || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fatoraty-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your invoices</p>
          </div>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FileText size={24} className="text-blue-400" />}
            label="Total Invoices"
            value={invoices.length.toString()}
          />
          <StatCard
            icon={<TrendingUp size={24} className="text-green-400" />}
            label="Total Spent"
            value={`${total.toFixed(2)} EGP`}
          />
          <StatCard
            icon={<Calendar size={24} className="text-purple-400" />}
            label="This Month"
            value={thisMonth.length.toString()}
          />
          <StatCard
            icon={<FileText size={24} className="text-orange-400" />}
            label="Categories"
            value={Object.keys(byCategory).length.toString()}
          />
        </div>

        {/* Category Breakdown */}
        {Object.keys(byCategory).length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">📂 By Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(byCategory).map(([cat, amount]) => (
                <div key={cat} className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 capitalize">{cat}</div>
                  <div className="text-xl font-bold">{amount.toFixed(2)} EGP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">🧾 Recent Invoices</h2>
          </div>
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No invoices yet. Send one via WhatsApp!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 font-mono text-sm">{inv.invoiceNumber || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{inv.date || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">{inv.vendor || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-700 capitalize">
                          {inv.category || "other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {(inv.total || 0).toFixed(2)} {inv.currency || "EGP"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
