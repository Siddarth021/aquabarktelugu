"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdminAction } from "@/actions/admin";
import { DEFAULT_ADMIN_SECRET } from "@/lib/admin-constants";
import { Fish, ShieldCheck, KeyRound, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenInput, setTokenInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-login if token is passed in query params
  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setTokenInput(queryToken);
      handleDirectLogin(queryToken);
    }
  }, [searchParams]);

  const handleDirectLogin = async (tokenToUse: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await loginAdminAction(tokenToUse);
      if (res.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error || "Invalid token.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Login failed. Please verify secret token.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Please enter the Admin Security Passcode or Token.");
      return;
    }
    await handleDirectLogin(tokenInput.trim());
  };

  const handleQuickDemoFill = () => {
    setTokenInput(DEFAULT_ADMIN_SECRET);
  };

  return (
    <div className="min-h-screen bg-aquabark-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-aquabark-dark flex items-center justify-center text-aquabark-primary shadow-lg mb-4">
          <Fish className="w-10 h-10 stroke-[2.2]" />
        </div>
        <h2 className="font-serif text-3xl font-extrabold text-aquabark-dark tracking-tight">
          AquaBark Admin
        </h2>
        <p className="mt-1 text-xs font-semibold text-aquabark-terracotta tracking-wider uppercase">
          Mobile Dashboard Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-aquabark-border space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-800">Admin Sign In</h3>
            <p className="text-xs text-slate-500">
              Welcome back, <span className="font-semibold text-aquabark-dark">Gundeti Siddarth</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-aquabark-dark uppercase tracking-wider mb-1.5">
                Administrator
              </label>
              <div className="relative">
                <ShieldCheck className="w-5 h-5 text-aquabark-accent absolute left-3.5 top-3" />
                <input
                  type="text"
                  disabled
                  value="Gundeti Siddarth"
                  className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-aquabark-dark uppercase tracking-wider mb-1.5">
                Password / Master Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter password (e.g. aquabarktelugu)"
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono rounded-2xl border-2 border-slate-200 focus:border-aquabark-dark focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill for instant development & testing (if configured) */}
          {DEFAULT_ADMIN_SECRET ? (
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Configured Bootstrap Token</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Protected by server-side cookie verification & RBAC token checks.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm">Loading admin login...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
