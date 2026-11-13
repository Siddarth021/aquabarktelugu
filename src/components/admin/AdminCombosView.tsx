"use client";

import { useState } from "react";
import { ComboDTO, ProductDTO } from "@/types";
import { formatINR } from "@/lib/utils";
import { deleteComboAction } from "@/actions/admin";
import { ComboModal } from "@/components/admin/ComboModal";
import {
  Sparkles,
  Plus,
  Trash2,
  Tag,
  Package,
  CheckCircle2,
  Percent,
} from "lucide-react";

interface AdminCombosViewProps {
  initialCombos: ComboDTO[];
  allProducts: ProductDTO[];
}

export function AdminCombosView({ initialCombos, allProducts }: AdminCombosViewProps) {
  const [combos, setCombos] = useState<ComboDTO[]>(initialCombos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this combo offer?")) return;

    setIsDeleting(id);
    try {
      const res = await deleteComboAction(id);
      if (res.success) {
        setCombos((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleComboCreated = (newCombo: ComboDTO) => {
    setCombos((prev) => [newCombo, ...prev]);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
            Combo Offers & Starter Bundles
          </h1>
          <p className="text-xs text-aquabark-muted">
            Curate package deals bundling live fish, live plants, and filtration accessories
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Combo Offer</span>
        </button>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combos.map((combo) => {
          const savings = combo.originalPrice - combo.comboPrice;
          const savingsPercent =
            combo.originalPrice > 0
              ? Math.round((savings / combo.originalPrice) * 100)
              : 0;

          return (
            <div
              key={combo.id}
              className="bg-white rounded-3xl border border-aquabark-border shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                {combo.imageUrl && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={combo.imageUrl}
                      alt={combo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{savingsPercent}% OFF</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-aquabark-dark text-base">{combo.title}</h3>
                    <p className="text-xs text-aquabark-muted mt-1 leading-relaxed">
                      {combo.description}
                    </p>
                  </div>

                  {/* Bundled Items */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Bundled In This Kit:
                    </span>
                    {combo.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-aquabark-dark shrink-0" />
                        <span>
                          <span className="font-bold">{item.quantity}x</span> {item.productName} ({item.variantTitle})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Price & Delete */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100/80 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Special Combo Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-xl text-aquabark-dark font-mono">
                      {formatINR(combo.comboPrice)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatINR(combo.originalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {combo.stockLimit && (
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      Limit: {combo.stockLimit}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(combo.id)}
                    disabled={isDeleting === combo.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                    title="Delete combo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ComboModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={allProducts}
        onSuccess={handleComboCreated}
      />
    </div>
  );
}
