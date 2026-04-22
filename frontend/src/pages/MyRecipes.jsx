import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Trash2,
  Clock,
  Users,
  Flame,
  ChefHat,
  Link2,
  PenLine,
  Sparkles,
  CheckSquare,
  Square,
  Globe,
  Lock,
  ExternalLink,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CUISINES = [
  "All Cuisines",
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
  "Asian Fusion",
  "Moroccan",
  "Thai",
];
const MEAL_TYPES = [
  "All Meals",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
];
const SKILL_LEVELS = ["All Skill Levels", "Easy", "Medium", "Hard"];

// ─── Import URL Modal ─────────────────────────
const ImportURLModal = ({ onClose, onSuccess }) => {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState("input"); // input | loading | preview
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    try {
      setStage("loading");
      const res = await apiFetch("/ai/import-url", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.recipe) {
        toast.error(data.message || "Failed to import recipe");
        setStage("input");
        return;
      }
      setPreview({ ...data.recipe, source_url: url });
      setStage("preview");
    } catch {
      toast.error("Failed to fetch URL");
      setStage("input");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiFetch("/recipes", {
        method: "POST",
        body: JSON.stringify({
          ...preview,
          prep_time: preview.prepTime ?? preview.prep_time ?? 0,
          cook_time: preview.cookTime ?? preview.cook_time ?? 0,
          source_url: url,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Recipe saved to vault!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const domain = url
    ? (() => {
        try {
          return new URL(url).hostname.replace("www.", "");
        } catch {
          return url;
        }
      })()
    : "";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">Import from URL</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {/* INPUT STAGE */}
          {stage === "input" && (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Paste any recipe URL — AllRecipes, NYT Cooking, food blogs, and
                more.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  placeholder="https://www.allrecipes.com/recipe/..."
                  className="flex-1 bg-[#0d1117] border border-orange-500/40 text-gray-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-orange-500 placeholder-gray-600 transition"
                  autoFocus
                />
                <button
                  onClick={handleFetch}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Fetch →
                </button>
              </div>
            </>
          )}

          {/* LOADING STAGE */}
          {stage === "loading" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">
                Reading page & extracting recipe...
              </p>
            </div>
          )}

          {/* PREVIEW STAGE */}
          {stage === "preview" && preview && (
            <div>
              <h3 className="text-white font-bold text-lg mb-2">
                {preview.name}
              </h3>
              {preview.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {preview.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-5">
                {(preview.cookTime || preview.cook_time) > 0 && (
                  <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
                    <Clock className="w-3 h-3" />
                    {preview.cookTime || preview.cook_time}m
                  </span>
                )}
                {preview.servings > 0 && (
                  <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
                    <Users className="w-3 h-3" />
                    {preview.servings} servings
                  </span>
                )}
                {preview.difficulty && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300 capitalize">
                    {preview.difficulty}
                  </span>
                )}
                {preview.ingredients?.length > 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
                    {preview.ingredients.length} ingredients
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStage("input");
                    setPreview(null);
                  }}
                  className="flex-1 border border-white/10 text-gray-300 text-sm font-medium py-2.5 rounded-xl hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                >
                  {saving ? "Saving..." : "Save to Vault"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Recipe Card ──────────────────────────────
const VaultRecipeCard = ({
  recipe,
  selected,
  selectMode,
  onSelect,
  onDelete,
}) => {
  const navigate = useNavigate();
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const isPublic = recipe.visibility !== "Private";
  const hasImage = !!recipe.image_url;

  const handleClick = () => {
    if (selectMode) {
      onSelect(recipe._id || recipe.id);
      return;
    }
    navigate(`/recipes/${recipe._id || recipe.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-[#111827] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${
        selected
          ? "border-orange-500/60 ring-1 ring-orange-500/40"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Select checkbox */}
      {selectMode && (
        <div className="absolute top-3 left-3 z-10">
          {selected ? (
            <CheckSquare className="w-5 h-5 text-orange-400" />
          ) : (
            <Square className="w-5 h-5 text-gray-500" />
          )}
        </div>
      )}

      {/* Image or placeholder */}
      {hasImage ? (
        <div className="h-40 overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      ) : recipe.source_url ? (
        /* Imported from URL — show source */
        <div className="h-40 bg-[#0d1117] flex flex-col items-center justify-center gap-1 border-b border-white/5">
          <Link2 className="w-5 h-5 text-blue-400" />
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            Original Source
          </p>
          <p className="text-xs text-gray-400 font-medium">
            {(() => {
              try {
                return new URL(recipe.source_url).hostname.replace("www.", "");
              } catch {
                return recipe.source_url;
              }
            })()}
          </p>
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-orange-500/5 to-purple-500/5 flex items-center justify-center border-b border-white/5">
          <ChefHat className="w-10 h-10 text-orange-500/30" />
        </div>
      )}

      {/* Card body */}
      <div className="p-4">
        {/* Badges row */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isPublic
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
            }`}
          >
            {isPublic ? (
              <Globe className="w-2.5 h-2.5" />
            ) : (
              <Lock className="w-2.5 h-2.5" />
            )}
            {isPublic ? "PUBLIC" : "PRIVATE"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recipe._id || recipe.id);
            }}
            className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition">
          {recipe.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.cuisine_type && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {recipe.cuisine_type}
            </span>
          )}
          {recipe.meal_type && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {recipe.meal_type}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
          {recipe.prep_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.prep_time}m prep
            </span>
          )}
          {recipe.cook_time > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500/50" />
              {recipe.cook_time}m cook
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
          {recipe.difficulty && (
            <span className="capitalize">{recipe.difficulty}</span>
          )}
        </div>

        {/* Open Recipe */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-orange-400 transition pt-3 border-t border-white/5">
          <ExternalLink className="w-3.5 h-3.5" />
          Open Recipe
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────
const MyRecipes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [mealType, setMealType] = useState("All Meals");
  const [skill, setSkill] = useState("All Skill Levels");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showImport, setShowImport] = useState(false);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/recipes");
      const data = await res.json();
      const formatted = data.map((r) => ({ ...r, id: r._id }));
      setRecipes(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    let result = [...recipes];
    if (search)
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      );
    if (cuisine !== "All Cuisines")
      result = result.filter((r) => r.cuisine_type === cuisine);
    if (mealType !== "All Meals")
      result = result.filter(
        (r) => r.meal_type?.toLowerCase() === mealType.toLowerCase(),
      );
    if (skill !== "All Skill Levels")
      result = result.filter(
        (r) => r.difficulty?.toLowerCase() === skill.toLowerCase(),
      );
    setFiltered(result);
  }, [recipes, search, cuisine, mealType, skill]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await apiFetch(`/recipes/${id}`, { method: "DELETE" });
      setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== id));
      toast.success("Recipe deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} recipe(s)?`)) return;
    try {
      await Promise.all(
        [...selected].map((id) =>
          apiFetch(`/recipes/${id}`, { method: "DELETE" }),
        ),
      );
      setRecipes((prev) => prev.filter((r) => !selected.has(r._id || r.id)));
      setSelected(new Set());
      setSelectMode(false);
      toast.success(`${selected.size} recipes deleted`);
    } catch {
      toast.error("Failed to delete some recipes");
    }
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const FilterPill = ({ label, value, options, onChange }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#111827] border border-white/10 text-gray-300 text-xs px-4 py-2 pr-8 rounded-full cursor-pointer hover:border-orange-500/30 transition outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-500">📦</span> My{" "}
              <span className="text-orange-500">Personal Vault</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {selectMode ? (
              <>
                <button
                  onClick={handleBulkDelete}
                  disabled={selected.size === 0}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selected.size})
                </button>
                <button
                  onClick={() => {
                    setSelectMode(false);
                    setSelected(new Set());
                  }}
                  className="text-xs px-4 py-2 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select Recipes
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Import URL
                </button>
                <button
                  onClick={() => navigate("/recipes/create")}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Create Manually
                </button>
                <button
                  onClick={() => navigate("/generate")}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate More
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your vault..."
              className="w-full bg-[#111827] border border-white/10 text-gray-200 text-sm pl-10 pr-4 py-2.5 rounded-full outline-none focus:border-orange-500/40 placeholder-gray-600 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <FilterPill
              label="Cuisine"
              value={cuisine}
              options={CUISINES}
              onChange={setCuisine}
            />
            <FilterPill
              label="Meals"
              value={mealType}
              options={MEAL_TYPES}
              onChange={setMealType}
            />
            <FilterPill
              label="Skill"
              value={skill}
              options={SKILL_LEVELS}
              onChange={setSkill}
            />
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((recipe) => (
              <VaultRecipeCard
                key={recipe._id || recipe.id}
                recipe={recipe}
                selected={selected.has(recipe._id || recipe.id)}
                selectMode={selectMode}
                onSelect={toggleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-orange-500/50" />
            </div>
            <p className="text-gray-500 text-sm">
              {recipes.length === 0
                ? "Your vault is empty"
                : "No recipes match your filters"}
            </p>
            {recipes.length === 0 && (
              <button
                onClick={() => navigate("/generate")}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <Sparkles className="w-4 h-4" />
                Generate Your First Recipe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Import URL Modal */}
      {showImport && (
        <ImportURLModal
          onClose={() => setShowImport(false)}
          onSuccess={fetchRecipes}
        />
      )}
    </div>
  );
};

export default MyRecipes;
