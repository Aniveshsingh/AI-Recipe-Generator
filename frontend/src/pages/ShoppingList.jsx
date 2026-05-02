// ════════════════════════════════════════════════════════
// FILE 1: frontend/src/pages/ShoppingList.jsx  (REPLACE)
// ════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  X,
  Check,
  Trash2,
  RotateCcw,
  ChefHat,
} from "lucide-react";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/shoppingList");
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setItems(data.map((i) => ({ ...i, id: i._id })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Group by recipe source or "Custom"
  const grouped = items.reduce((acc, item) => {
    const key = item.recipe_name || "Custom Items";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleToggle = async (item) => {
    try {
      await apiFetch(`/shoppingList/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, is_checked: !item.is_checked }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_checked: !i.is_checked } : i,
        ),
      );
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_checked: !i.is_checked } : i,
        ),
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/shoppingList/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleClearChecked = async () => {
    if (!confirm("Remove all checked items?")) return;
    const checked = items.filter((i) => i.is_checked);
    await Promise.all(
      checked.map((i) =>
        apiFetch(`/shoppingList/${i.id}`, { method: "DELETE" }).catch(() => {}),
      ),
    );
    setItems((prev) => prev.filter((i) => !i.is_checked));
    toast.success("Checked items cleared");
  };

  const handleReset = () => {
    setItems((prev) => prev.map((i) => ({ ...i, is_checked: false })));
    toast.success("List reset");
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) {
      toast.error("Enter an item name");
      return;
    }
    try {
      const res = await apiFetch("/shoppingList", {
        method: "POST",
        body: JSON.stringify({
          ingredient_name: customName,
          quantity: parseFloat(customAmount) || 1,
          unit: "",
          category: "Other",
          is_checked: false,
          from_meal_plan: false,
        }),
      });
      const data = await res.json();
      setItems((prev) => [...prev, { ...data, id: data._id }]);
      setCustomName("");
      setCustomAmount("");
      toast.success("Item added");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-orange-400" />
              Shopping List
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Organize your ingredients for the next culinary session.
            </p>
          </div>
          <div className="flex gap-2">
            {checkedCount > 0 && (
              <button
                onClick={handleClearChecked}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Checked
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add custom + quick links */}
          <div className="space-y-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" /> Add Custom Item
              </h2>
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  placeholder="What do you need? (e.g. Eggs)"
                  className="w-full bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition"
                />
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  placeholder="Amount (e.g. 1 dozen)"
                  className="w-full bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition"
                />
              </div>
              <button
                onClick={handleAddCustom}
                className="w-full flex items-center justify-center gap-2 bg-orange-500/20 border border-orange-400 hover:bg-orange-400 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                <Plus className="w-4 h-4" /> Add to List
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-3">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  to="/generate"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white group"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-orange-400" /> New Recipe
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-400">
                    ›
                  </span>
                </Link>
                <Link
                  to="/recipes"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white group"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-400" /> My
                    Vault
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-400">
                    ›
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Grouped items */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Your shopping list is empty.
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Add ingredients from a recipe or add custom items.
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([groupName, groupItems]) => (
                <div
                  key={groupName}
                  className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-orange-400" />
                      {groupName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {groupItems.length} items
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition group"
                      >
                        <button
                          onClick={() => handleToggle(item)}
                          className="shrink-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                              item.is_checked
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-gray-600 hover:border-orange-400"
                            }`}
                          >
                            {item.is_checked && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${item.is_checked ? "line-through text-gray-600" : "text-white"}`}
                          >
                            {item.ingredient_name}
                          </p>
                          <p
                            className={`text-xs ${item.is_checked ? "text-gray-700" : "text-orange-400"}`}
                          >
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
