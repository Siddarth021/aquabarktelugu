"use client";

import { useState } from "react";
import { updateAdminSettingsAction } from "@/actions/admin";
import {
  Settings,
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  Check,
  AlertCircle,
  ShieldCheck,
  Flame,
  Store,
} from "lucide-react";

interface AdminSettingsViewProps {
  initialSettings: Record<string, string>;
}

export function AdminSettingsView({ initialSettings }: AdminSettingsViewProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const res = await updateAdminSettingsAction(settings);
      if (res.success) {
        setSuccessMessage("Settings successfully saved and live across store.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
          Store & Transport Feasibility Settings
        </h1>
        <p className="text-xs text-aquabark-muted">
          Configure regional parcel hubs, minimum orders, live transit policies, and owner alert channels
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Transport & Feasibility Rules */}
        <div className="bg-white rounded-3xl p-5 border border-aquabark-border shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-aquabark-border/60">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">
                Transport & Dispatch Feasibility
              </h3>
              <p className="text-xs text-aquabark-muted">
                Bus parcel & railway delivery routes across Andhra Pradesh & Telangana
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min. Order for Live Fish (₹)
              </label>
              <input
                type="number"
                value={settings.min_order_live_fish || "499"}
                onChange={(e) => handleChange("min_order_live_fish", e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-aquabark-dark rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Prevents unfeasible single-fish shipments requiring thermocol packaging
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min. Order for Bus Parcel (₹)
              </label>
              <input
                type="number"
                value={settings.min_order_bus_parcel || "799"}
                onChange={(e) => handleChange("min_order_bus_parcel", e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-aquabark-dark rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Threshold to unlock express RTC parcel dispatch
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Departure Hub
            </label>
            <input
              type="text"
              value={settings.departure_hub || "MGBS Hyderabad / PNBS Vijayawada Hub"}
              onChange={(e) => handleChange("departure_hub", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supported Bus Parcel Operators
            </label>
            <input
              type="text"
              value={
                settings.supported_bus_operators ||
                "TSRTC, APSRTC, Orange Travels, Morning Star, Kaveri Travels"
              }
              onChange={(e) => handleChange("supported_bus_operators", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supported Railway Parcel Stations
            </label>
            <input
              type="text"
              value={
                settings.supported_rail_stations ||
                "Secunderabad (SC), Vijayawada (BZA), Visakhapatnam (VSKP), Tirupati (TPTY), Rajahmundry (RJY), Guntur (GNT)"
              }
              onChange={(e) => handleChange("supported_rail_stations", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Arrival Transit Policy (Shown at Checkout)
            </label>
            <textarea
              rows={2}
              value={settings.live_transit_policy || ""}
              onChange={(e) => handleChange("live_transit_policy", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
            />
          </div>

          {/* Extreme Weather Advisory Toggle */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Extreme Weather / Heatwave Advisory Banner
                </span>
                <span className="text-[11px] text-amber-700">
                  Adds special cooling ice packs and alerts customers of possible 24hr acclimation holds
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.heatwave_advisory_active === "true"}
              onChange={(e) =>
                handleChange("heatwave_advisory_active", e.target.checked ? "true" : "false")
              }
              className="w-5 h-5 rounded text-aquabark-dark"
            />
          </div>
        </div>

        {/* SECTION 2: Owner Contact & Real-Time WhatsApp Alert Channel */}
        <div className="bg-white rounded-3xl p-5 border border-aquabark-border shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-aquabark-border/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-aquabark-dark text-base">
                Owner Mobile Phone & WhatsApp Alerts
              </h3>
              <p className="text-xs text-aquabark-muted">
                Receive instant notifications when customers place an order or cancel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Owner WhatsApp Alert Number *
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={settings.whatsapp_alert_number || "+91 98480 54321"}
                  onChange={(e) => handleChange("whatsapp_alert_number", e.target.value)}
                  placeholder="+91 98480 54321"
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold text-aquabark-dark rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Instant order ping delivered to owner&apos;s phone
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Support Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={settings.store_phone || "+91 94400 12345"}
                  onChange={(e) => handleChange("store_phone", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storefront Name
              </label>
              <input
                type="text"
                value={settings.store_name || "AquaBark Telugu Aquarium Studio"}
                onChange={(e) => handleChange("store_name", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.store_email || "support@aquabarktelugu.com"}
                onChange={(e) => handleChange("store_email", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-aquabark-primary"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving Feasibility & Settings...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
