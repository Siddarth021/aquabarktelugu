"use client";

import { useState } from "react";
import { CategoryDTO } from "@/types";
import {
  toggleCategoryActiveAction,
  reorderCategoriesAction,
} from "@/actions/admin";
import { CategoryModal } from "@/components/admin/CategoryModal";
import {
  FolderTree,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Power,
  Layers,
} from "lucide-react";

interface AdminCategoriesViewProps {
  initialCategories: CategoryDTO[];
}

export function AdminCategoriesView({ initialCategories }: AdminCategoriesViewProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleActive = async (id: string) => {
    setIsUpdating(true);
    try {
      const res = await toggleCategoryActiveAction(id);
      if (res.success && res.isActive !== undefined) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: res.isActive! } : c))
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const moveCategory = async (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === categories.length - 1)
    ) {
      return;
    }

    const newCats = [...categories];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;

    setCategories(newCats);

    setIsUpdating(true);
    try {
      await reorderCategoriesAction(newCats.map((c) => c.id));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoryCreated = (newCat: CategoryDTO) => {
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-aquabark-dark">
            Categories & Collections
          </h1>
          <p className="text-xs text-aquabark-muted">
            Add, reorder navigation hierarchy, and toggle active display in storefront
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-aquabark-dark hover:bg-aquabark-darker text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`p-4 rounded-3xl border transition-all ${
              cat.isActive
                ? "bg-white border-aquabark-border shadow-xs"
                : "bg-slate-50/80 border-slate-200 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Category Info */}
              <div className="flex items-center gap-3">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-aquabark-secondary/50 flex items-center justify-center text-aquabark-dark shrink-0">
                    <FolderTree className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-aquabark-dark text-base">{cat.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      /{cat.slug}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-aquabark-muted mt-0.5 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Reorder and Toggle Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Up/Down reorder arrows */}
                <div className="flex flex-col gap-1">
                  <button
                    disabled={idx === 0 || isUpdating}
                    onClick={() => moveCategory(idx, "UP")}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === categories.length - 1 || isUpdating}
                    onClick={() => moveCategory(idx, "DOWN")}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 border border-slate-200"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Active / Inactive switch */}
                <button
                  onClick={() => handleToggleActive(cat.id)}
                  disabled={isUpdating}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    cat.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                  }`}
                  title={cat.isActive ? "Deactivate category" : "Activate category"}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {cat.isActive ? "Deactivate" : "Activate"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
}
