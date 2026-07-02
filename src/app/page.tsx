"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";

export default function Upgrade() {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💎</div>
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          <p className="text-gray-400 mt-2">Unlock unlimited invoices</p>
        </div>

        <div className="flex bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              plan === "monthly" ? "bg-green-500 text-white" : "text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan("yearly")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              plan === "yearly" ? "bg-green-500 text-white" : "text-gray-400"
            }`}
          >
            Yearly <span className="text-xs">(-17%)</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-5xl font-bold">${plan === "monthly" ? "5" : "50"}</span>
            <span className="text-gray-400">/{plan === "monthly" ? "month" : "year"}</span>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Unlimited invoices",
              "Excel & PDF exports",
              "Advanced analytics",
              "Priority support",
              "Custom categories",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check size={20} className="text-green-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
            <Zap size={20} />
            Upgrade Now
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure payment via Stripe
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Payment Methods</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">💳</span>
              <span>Credit/Debit Card (Visa, Mastercard)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <span>Vodafone Cash (Egypt)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🏦</span>
              <span>InstaPay (Egypt)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
