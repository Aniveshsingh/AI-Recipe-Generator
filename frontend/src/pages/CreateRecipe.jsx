import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Save } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const CUISINES = [
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "French",
  "Mediterranean",
  "American",
  "Asian",
  "Other",
];

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisine_type: "",
    meal_type: "",
    difficulty: "Medium",
    prep_time: 30,
    cook_time: 0,
    servings: 2,
    visibility: "Public",
    chefNote: "",
  });
  const [ingredients, setIngredients] = useState([{ amount: "", name: "" }]);
  const [instructions, setInstructions] = useState([""]);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Ingredients
  const addIngredient = () =>
    setIngredients((p) => [...p, { amount: "", name: "" }]);
  const removeIngredient = (i) =>
    setIngredients((p) => p.filter((_, idx) => idx !== i));
  const updateIngredient = (i, key, val) =>
    setIngredients((p) =>
      p.map((ing, idx) => (idx === i ? { ...ing, [key]: val } : ing)),
    );

  // Instructions
  const addStep = () => setInstructions((p) => [...p, ""]);
  const removeStep = (i) =>
    setInstructions((p) => p.filter((_, idx) => idx !== i));
  const updateStep = (i, val) =>
    setInstructions((p) => p.map((s, idx) => (idx === i ? val : s)));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Recipe title is required");
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }
    const validSteps = instructions.filter((s) => s.trim());
    if (validSteps.length === 0) {
      toast.error("Add at least one instruction step");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        ingredients: validIngredients.map((ing) => {
          const parts = ing.amount.trim().split(" ");
          const qty = parseFloat(parts[0]) || 0;
          const unit = parts.slice(1).join(" ") || "pieces";
          return { name: ing.name, quantity: qty, unit };
        }),
        instructions: validSteps,
        chef_note: form.chefNote,
      };

      const res = await apiFetch("/recipes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast.success("Recipe saved to vault!");
      navigate("/recipes");
    } catch {
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition";
  const labelClass =
    "block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5";

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0b0b0c]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/recipes")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vault
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8">
          <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🍳 Create Your Recipe
          </h1>

          {/* Title */}
          <div className="mb-4">
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="e.g. Grandma's Lasagna"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="A short description of the dish..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            <div>
              <label className={labelClass}>Cuisine</label>
              <input
                type="text"
                value={form.cuisine_type}
                onChange={(e) => updateForm("cuisine_type", e.target.value)}
                placeholder="e.g. Italian"
                className={inputClass}
                list="cuisines"
              />
              <datalist id="cuisines">
                {CUISINES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Meal Type</label>
              <select
                value={form.meal_type}
                onChange={(e) => updateForm("meal_type", e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => updateForm("difficulty", e.target.value)}
                className={inputClass}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prep Time (min)</label>
              <input
                type="number"
                value={form.prep_time}
                onChange={(e) =>
                  updateForm("prep_time", parseInt(e.target.value) || 0)
                }
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className={labelClass}>Cook Time (min)</label>
              <input
                type="number"
                value={form.cook_time}
                onChange={(e) =>
                  updateForm("cook_time", parseInt(e.target.value) || 0)
                }
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className={labelClass}>Servings</label>
              <input
                type="number"
                value={form.servings}
                onChange={(e) =>
                  updateForm("servings", parseInt(e.target.value) || 1)
                }
                className={inputClass}
                min="1"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className={labelClass}>Visibility</label>
            <button
              onClick={() =>
                updateForm(
                  "visibility",
                  form.visibility === "Public" ? "Private" : "Public",
                )
              }
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition ${
                form.visibility === "Public"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-gray-500/10 border-gray-500/30 text-gray-400"
              }`}
            >
              {form.visibility === "Public" ? "🌍" : "🔒"} {form.visibility}
            </button>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🧂 Ingredients *
              </h2>
              <button
                onClick={addIngredient}
                className="flex items-center gap-1 text-xs text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-full hover:bg-orange-500/10 transition"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={(e) =>
                      updateIngredient(i, "amount", e.target.value)
                    }
                    placeholder="Amount (e.g. 200 grams)"
                    className="bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-3 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition w-40 shrink-0"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(i, "name", e.target.value)
                    }
                    placeholder="Ingredient"
                    className="flex-1 bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-3 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition"
                  />
                  <button
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length === 1}
                    className="w-8 h-8 flex items-center justify-center text-red-400 border border-red-500/20 rounded-full hover:bg-red-500/10 disabled:opacity-30 transition shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold flex items-center gap-2">
                👨‍🍳 Instructions *
              </h2>
              <button
                onClick={addStep}
                className="flex items-center gap-1 text-xs text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-full hover:bg-orange-500/10 transition"
              >
                <Plus className="w-3 h-3" /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center mt-2 shrink-0">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                    rows={2}
                    className="flex-1 bg-[#0d1117] border border-white/10 text-gray-200 text-sm px-3 py-2.5 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-600 transition resize-none"
                  />
                  <button
                    onClick={() => removeStep(i)}
                    disabled={instructions.length === 1}
                    className="w-8 h-8 flex items-center justify-center text-red-400 border border-red-500/20 rounded-full hover:bg-red-500/10 disabled:opacity-30 transition shrink-0 mt-2"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Note */}
          <div className="mb-2">
            <label className={labelClass}>Chef's Note</label>
            <textarea
              value={form.chefNote}
              onChange={(e) => updateForm("chefNote", e.target.value)}
              placeholder="A tip, technique, or substitution..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;
