import Link from "next/link";
import { MessageCircle, FileText, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🧾</div>
          <h1 className="text-4xl font-bold mb-4">Fatoraty</h1>
          <p className="text-xl text-gray-300 mb-8">
            Manage your invoices via WhatsApp. No app to install.
          </p>
          <a
            href="https://wa.me/YOUR_PHONE_NUMBER?text=Start"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition"
          >
            <MessageCircle size={24} />
            Start on WhatsApp
          </a>
          <p className="mt-4 text-sm text-gray-400">
            Free 30 invoices/month • No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText size={32} className="text-blue-400" />}
            title="Snap & Save"
            desc="Send invoice photos via WhatsApp. We extract and organize everything."
          />
          <FeatureCard
            icon={<BarChart3 size={32} className="text-green-400" />}
            title="Smart Reports"
            desc="Monthly summaries by category. Know where your money goes."
          />
          <FeatureCard
            icon={<Shield size={32} className="text-purple-400" />}
            title="Secure Archive"
            desc="All invoices stored safely. Export to Excel or PDF anytime."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0</div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li className="flex items-center gap-2">✅ 30 invoices/month</li>
                <li className="flex items-center gap-2">✅ Basic reports</li>
                <li className="flex items-center gap-2">✅ WhatsApp support</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-gray-700 text-white font-medium">
                Current Plan
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gray-800 rounded-2xl p-8 border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-4">$5<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li className="flex items-center gap-2">✅ Unlimited invoices</li>
                <li className="flex items-center gap-2">✅ Excel & PDF exports</li>
                <li className="flex items-center gap-2">✅ Advanced analytics</li>
                <li className="flex items-center gap-2">✅ Priority support</li>
              </ul>
              <Link
                href="/upgrade"
                className="block w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium text-center transition"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Fatoraty. Built for small businesses.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
