"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fish, Phone, Mail, User, MapPin, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    localStorage.setItem("aquabark_user_name", name);
    localStorage.setItem("aquabark_user_phone", phone);
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
              Join AquaBark Circle
            </h1>
            <p className="text-xs text-aquabark-muted">
              Get 10% off your first live parcel dispatch and access to secret breeding drops.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-aquabark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                Mobile Number (For Bus/Rail Parcel SMS) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-aquabark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9848012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-aquabark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijayawada"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-aquabark-dark block mb-1.5">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-3 bg-aquabark-bg border border-aquabark-border rounded-xl focus:border-aquabark-dark focus:outline-none"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full shadow-soft flex items-center justify-center gap-2 transition-all mt-3"
            >
              <span>{loading ? "Creating Account..." : "CREATE ACCOUNT"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-aquabark-border text-xs text-aquabark-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-aquabark-dark hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

