"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fish, Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save session in localStorage
    localStorage.setItem("aquabark_user_phone", identifier || "9848012345");
    localStorage.setItem("aquabark_user_name", "Kiran Varma");
    localStorage.setItem("aquabark_user_logged_in", "true");

    setTimeout(() => {
      setLoading(false);
      router.push("/account");
    }, 400);
  };

  return (
    <div className="py-16 bg-aquabark-bg min-h-[75vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] border border-aquabark-border shadow-card p-8 sm:p-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary mx-auto shadow-sm">
              <Fish className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aquabark-dark">
              Welcome Back
            </h1>
            <p className="text-xs text-aquabark-muted">
              Access your live fish order status, tracking receipts & wishlist.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-aquabark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9848012345"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-aquabark-dark">Password / OTP</label>
                <a href="#" className="text-[11px] text-aquabark-terracotta hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-aquabark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full shadow-soft flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{loading ? "Signing In..." : "SIGN IN"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-aquabark-border text-xs text-aquabark-muted">
            Don't have an account yet?{" "}
            <Link href="/register" className="font-bold text-aquabark-dark hover:underline">
              Create One
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-aquabark-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit Encrypted Customer Portal</span>
          </div>

        </div>
      </div>
    </div>
  );
}

