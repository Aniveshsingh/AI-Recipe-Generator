import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChefHat,
  Clock,
  Users,
  RefreshCw,
  BookmarkPlus,
  Link2,
  PenLine,
  X,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  RotateCcw,
  Zap,
  Coins,
} from "lucide-react";

import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ImportURLModal from "../components/ImportUrl";

// ─── Constants ───────────────────────────────
const CUISINES = [
  "Any Cuisine",
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "French",
  "Mediterranean",
  "American",
];
const DIETS = [
  "No Restrictions",
  "Vegan",
  "Vegetarian",
  "Keto",
  "High Protein",
  "Gluten-Free",
];
const SKILLS = ["Beginner", "Intermediate", "Advanced"];
const MAX_TIMES = ["Any Time", "Under 15 min", "Under 30 min", "Under 1 hour"];

const ADVANCED_PROMPTS = [
  "Gourmet dinner involving seasonal asparagus",
  "A Michelin-starred take on a classic comfort burger",
  "Authentic 12-hour slow-cooked Japanese Ramen base",
  "Reconstruct a childhood favorite using modern techniques",
  "Deconstructed lemon tart with basil infusion",
  "Restaurant-style pan-seared duck breast with cherry reduction",
  "A show-stopping 5-course tasting menu for date night",
  "Street food-inspired tacos with homemade salsa verde",
  "A vibrant Buddha bowl with miso tahini dressing",
  "Homemade fresh pasta with brown butter and sage",
  "Classic French onion soup with a gruyère crust",
  "Smoky BBQ pulled jackfruit for a summer cookout",
  "Japanese-style black sesame cheesecake",
];

const QUICK_IDEAS = [
  { label: "Vegan", emoji: "🌿" },
  { label: "Under 20 min", emoji: "⚡" },
  { label: "Spicy", emoji: "🔥" },
  { label: "Comfort Food", emoji: "🤤" },
  { label: "Seafood", emoji: "🫧" },
  { label: "Low Carb", emoji: "🥑" },
];

// ─── Detect mode from prompt ─────────────────
const detectMode = (text) => {
  const lower = text.toLowerCase();
  const vibeWords = [
    "cozy",
    "comfort",
    "mood",
    "vibe",
    "feeling",
    "rainy",
    "summer",
    "warm",
    "chill",
    "romantic",
    "spicy",
    "under",
    "quick",
    "easy",
    "healthy",
    "light",
  ];
  const ingredientWords = [
    "with",
    "using",
    "made from",
    "i have",
    "tomato",
    "chicken",
    "rice",
    "pasta",
    "egg",
    "flour",
  ];
  if (vibeWords.some((w) => lower.includes(w))) return "vibe";
  if (ingredientWords.some((w) => lower.includes(w))) return "ingredients";
  return "dish";
};

// ─── Dropdown ────────────────────────────────
const FilterDropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-col gap-1 min-w-[110px]">
      <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
        {label}
      </span>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 bg-[#0d1117] border border-white/10 text-white text-xs px-3 py-2 rounded-lg hover:border-orange-500/40 transition"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-[#0d1117] border border-white/10 rounded-lg shadow-xl min-w-[140px] overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer transition ${value === opt ? "text-orange-400 bg-orange-500/10" : "text-gray-300 hover:bg-white/5"}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Recipe Result Card ───────────────────────
const RecipeResult = ({
  recipe,
  cached,
  onSave,
  onRegenerate,
  onRefined,
  saving,
  isAuthenticated,
  onAuthRequired,
}) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);

  const toggleStep = (i) => {
    const s = new Set(expandedSteps);
    s.has(i) ? s.delete(i) : s.add(i);
    setExpandedSteps(s);
  };

  const difficultyColor =
    {
      easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      hard: "text-red-400 bg-red-500/10 border-red-500/20",
    }[recipe.difficulty?.toLowerCase()] ||
    "text-gray-400 bg-gray-500/10 border-gray-500/20";

  const handleRefine = async () => {
    if (!refineText.trim()) {
      toast.error("Describe what you want to change");
      return;
    }
    if (!isAuthenticated) {
      onAuthRequired("refine recipes");
      return;
    }
    try {
      setRefining(true);
      const res = await apiFetch("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          mode: "refine",
          refineRequest: refineText,
          currentRecipe: recipe,
          cuisine: "Any",
          diet: "No restrictions",
          servings: recipe.servings,
        }),
      });
      const data = await res.json();
      if (res.status === 401 && data.requiresAuth) {
        onAuthRequired("refine recipes");
        return;
      }
      if (!res.ok || !data.recipe) {
        toast.error(data.message || "Refinement failed");
        return;
      }
      onRefined(data.recipe, data.credits);
      setRefineText("");
      toast.success("Recipe refined!");
    } catch {
      toast.error("Failed to refine");
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="mt-8 space-y-4 animate-fade-in">
      {/* ── Recipe Header Card ── */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-7 backdrop-blur-md">
        {cached && (
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full mb-3">
            <Zap className="w-3 h-3" />
            From cache · instant
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
          {recipe.name}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-2xl">
          {recipe.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.cookTime > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
              <Clock className="w-3 h-3" />
              {recipe.prepTime}m prep
            </span>
          )}
          {recipe.cookTime > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
              <Flame className="w-3 h-3 text-orange-400" />
              {recipe.cookTime}m cook
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-300">
              <Users className="w-3 h-3" />
              {recipe.servings} servings
            </span>
          )}
          {recipe.difficulty && (
            <span
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${difficultyColor}`}
            >
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20"
          >
            <BookmarkPlus className="w-4 h-4" />
            {saving ? "Saving..." : "Save to Vault"}
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-medium px-5 py-2.5 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>

      {/* ── Chat with the Chef ── */}
      <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              Chat with the Chef
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Request changes — e.g., "swap protein", "make it vegan", "elevate
              to Michelin-star quality"
            </p>
          </div>
          <Info className="w-4 h-4 text-gray-600 mt-0.5 shrink-0 ml-auto" />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRefine()}
            placeholder="e.g. 'Make it spicy', 'Swap salmon for chicken', 'Elevate to Michelin-star quality'..."
            className="flex-1 bg-[#0d1117] border border-white/10 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-orange-500/50 placeholder-gray-600 transition"
          />
          <button
            onClick={handleRefine}
            disabled={refining}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-xl transition whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            {refining ? "Refining..." : "Refine"}
          </button>
        </div>
      </div>

      {/* ── Ingredients + Instructions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Ingredients */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🧂 Ingredients
          </h3>
          <div className="space-y-0">
            {recipe.ingredients?.map((ing, i) => (
              <div
                key={i}
                className="flex items-baseline gap-3 py-2.5 border-b border-white/5 last:border-0"
              >
                <span className="text-orange-400 font-semibold text-sm tabular-nums shrink-0 min-w-[70px]">
                  {ing.quantity} {ing.unit}
                </span>
                <span className="text-gray-300 text-sm">{ing.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-3 bg-[#111827]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            👨‍🍳 Instructions
          </h3>
          <div className="space-y-2">
            {recipe.instructions?.map((step, i) => {
              const isExpanded = expandedSteps.has(i);
              const isLong = step.length > 100;
              return (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                  onClick={() => isLong && toggleStep(i)}
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-gray-300 text-sm leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}
                    >
                      {step}
                    </p>
                    {isLong && (
                      <button className="text-xs text-orange-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Read more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Chef's Note ── */}
      {recipe.chefNote && (
        <div className="bg-[#111827]/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md">
          <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase mb-2">
            Chef's Note
          </p>
          <p className="text-gray-300 text-sm leading-relaxed italic">
            {recipe.chefNote}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────
const RecipeGenerator = () => {
  const { isAuthenticated, updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: "Any Cuisine",
    servings: 4,
    diet: "No Restrictions",
    skill: "Intermediate",
    maxTime: "Any Time",
    visibility: "Public",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [wasCached, setWasCached] = useState(false);
  const [credits, setCredits] = useState(null);
  const [saving, setSaving] = useState(false);
  const advancedRef = useRef(null);
  const resultRef = useRef(null);
  const [showImport, setShowImport] = useState(false);

  const requireAuth = (actionLabel) => {
    toast.error(`Please sign in to ${actionLabel}`);
    setTimeout(() => navigate("/login"), 600);
  };

  const requireAuthAction = () => {
    if (!isAuthenticated) {
      toast("Login required", { icon: "🔒" });
      setTimeout(() => navigate("/login"), 800);
      return false;
    }
    return true;
  };
  // Close advanced prompts on outside click
  useEffect(() => {
    const handler = (e) => {
      if (advancedRef.current && !advancedRef.current.contains(e.target)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (user?.credits !== undefined) {
      setCredits(user.credits);
    }
  }, [user]);

  // Scroll to result after generation
  useEffect(() => {
    if (generatedRecipe && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [generatedRecipe]);

  const handleQuickIdea = (label) => {
    setInputValue(label);
  };

  const handleAdvancedPrompt = (prompt) => {
    setInputValue(prompt);
    setShowAdvanced(false);
  };

  const handleGenerate = async (overridePrompt = null, opts = {}) => {
    const { bypassCache = false } = opts;
    const prompt = overridePrompt || inputValue;
    if (!prompt.trim()) {
      toast.error("Describe what you want to cook");
      return;
    }

    if (!isAuthenticated) {
      requireAuth("generate recipes");
      return;
    }
    // if (bypassCache && !isAuthenticated) {
    //   requireAuth("regenerate recipes");
    //   return;
    // }

    const mode = detectMode(prompt);

    try {
      setGenerating(true);
      setGeneratedRecipe(null);

      const res = await apiFetch("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          mode,
          userPrompt: prompt,
          cuisine: filters.cuisine === "Any Cuisine" ? "Any" : filters.cuisine,
          diet:
            filters.diet === "No Restrictions"
              ? "No restrictions"
              : filters.diet,
          servings: filters.servings,
          cookingTime: filters.maxTime === "Any Time" ? "Any" : filters.maxTime,
          bypassCache,
        }),
      });

      const data = await res.json();
      if (data.credits !== undefined) {
        updateUser({ credits: data.credits });
      }

      if (res.status === 401 && data.requiresAuth) {
        requireAuth("generate recipes");
        return;
      }

      if (res.status === 402) {
        toast.error(data.message || "Daily credits exhausted");
        if (typeof data.credits === "number") setCredits(data.credits);

        return;
      }

      if (!res.ok || !data.recipe) {
        toast.error(data.message || "Failed to generate recipe");
        return;
      }

      const recipe = {
        ...data.recipe,
        prepTime: data.recipe.prepTime ?? data.recipe.prep_time ?? 0,
        cookTime: data.recipe.cookTime ?? data.recipe.cook_time ?? 0,
      };

      setGeneratedRecipe(recipe);
      setWasCached(!!data.cached);
      if (typeof data.credits === "number") setCredits(data.credits);

      toast.success(
        data.cached ? "Recipe loaded from cache!" : "Recipe generated!",
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate recipe");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (!isAuthenticated) {
      requireAuth("regenerate recipes");
      return;
    }
    handleGenerate(null, { bypassCache: true });
  };

  const handleRefined = (refinedRecipe, newCredits) => {
    setGeneratedRecipe(refinedRecipe);
    setWasCached(false);
    if (typeof newCredits === "number") setCredits(newCredits);
  };

  const handleSave = async () => {
    if (!generatedRecipe) return;
    if (!isAuthenticated) {
      requireAuth("save recipes");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        recipe: {
          ...generatedRecipe,
          prep_time: generatedRecipe.prepTime,
          cook_time: generatedRecipe.cookTime,
        },
      };
      const res = await apiFetch("/recipes/save", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        requireAuth("save recipes");
        return;
      }
      if (!res.ok) throw new Error();
      toast.success("Recipe saved to vault!");
    } catch {
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const handleNewChat = () => {
    setGeneratedRecipe(null);
    setWasCached(false);
    setInputValue("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen  text-white">
      {/* NEW CHAT button */}
      {generatedRecipe && (
        <div className="fixed top-20 right-6 z-40">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-orange-500/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            NEW CHAT
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-22 pb-20">
        {/* ── Hero Title ── */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white tracking-tight">
            Your Personal
          </h1>
          <h2 className="text-3xl md:text-6xl font-extrabold leading-tight text-orange-400 tracking-tight mb-3">
            AI CHEF
          </h2>
          <div className=" flex justify-center items-center gap-2 text-3xl md:text-6xl font-extrabold leading-tight text-emerald-500 tracking-tight mb-5">
            <ChefHat className="w-[30px] h-[30px] md:w-[50px] md:h-[50px]" />
            <span className="text-white">SmartChef</span> AI
          </div>
          <p className="text-lg text-gray-400 mb-2">
            What are we{" "}
            <span className="text-orange-400 font-medium">cooking</span> today?
          </p>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Describe an ingredient, a mood, or a dietary goal — our{" "}
            <span className="text-white font-medium">
              SmartChef <span className="text-emerald-500">AI</span>
            </span>{" "}
            ransforms your cravings into structured, delicious recipes
            instantly.
          </p>

          {/* Credits / Free-trial chip */}
          <div className="mt-5 flex justify-center">
            {isAuthenticated ? (
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-300">
                <Coins className="w-3.5 h-3.5" />
                {credits ?? user?.credits ?? "—"} credits left today
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-md font-medium px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Login to generate recipes
                <button
                  onClick={() => navigate("/login")}
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Input Bar ── */}
        <div className="relative mb-4" ref={advancedRef}>
          {/* Advanced Prompts Panel */}
          {showAdvanced && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0d1117] border border-white/10 rounded-2xl p-5 z-50 shadow-2xl">
              <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
                Advanced Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {ADVANCED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleAdvancedPrompt(p)}
                    className="text-left text-sm text-gray-300 hover:text-white transition py-0.5"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 bg-[#0f172a] border border-white/10 rounded-2xl px-4 py-3 shadow-xl focus-within:border-orange-500/40 transition">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder='e.g. "Cozy salmon dinner under 400 calories with dill"'
              className="flex-1 bg-transparent text-sm outline-none text-gray-200 placeholder-gray-600"
            />
            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="mr-2 text-gray-600 hover:text-gray-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* Advanced prompts toggle */}
            <div className="flex justify-end items-center">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center mr-3 hover:border-orange-400 transition text-gray-500 hover:text-orange-400"
                title="Advanced prompts"
              >
                <Sparkles className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (!requireAuthAction()) return;
                  if (generating) return;

                  handleGenerate();
                }}
                title={!isAuthenticated ? "Login to generate recipes" : ""}
                className={`w-[50%] sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg
    ${
      !isAuthenticated
        ? "opacity-60 cursor-not-allowed bg-[#0F828C]/50 text-white"
        : "bg-[#0F828C] hover:bg-emerald-600 text-white shadow-emerald-500/20"
    }
  `}
              >
                <Sparkles className="w-4 h-4" />
                {generating ? "Cooking..." : "Generate Magic"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 mb-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-5 items-end">
            <FilterDropdown
              label="Cuisine"
              value={filters.cuisine}
              options={CUISINES}
              onChange={(v) => setFilters((f) => ({ ...f, cuisine: v }))}
            />

            {/* Servings */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                Servings
              </span>
              <div className="flex justify-center py-1.5 gap-6 items-center bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      servings: Math.max(1, f.servings - 1),
                    }))
                  }
                  className=" text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                >
                  −
                </button>
                <span className=" text-white text-sm font-medium tabular-nums">
                  {filters.servings}
                </span>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, servings: f.servings + 1 }))
                  }
                  className=" text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <FilterDropdown
              label="Diet"
              value={filters.diet}
              options={DIETS}
              onChange={(v) => setFilters((f) => ({ ...f, diet: v }))}
            />
            <FilterDropdown
              label="Skill"
              value={filters.skill}
              options={SKILLS}
              onChange={(v) => setFilters((f) => ({ ...f, skill: v }))}
            />
            <FilterDropdown
              label="Max Time"
              value={filters.maxTime}
              options={MAX_TIMES}
              onChange={(v) => setFilters((f) => ({ ...f, maxTime: v }))}
            />

            {/* Visibility pill */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                Visibility
              </span>
              <button
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    visibility:
                      f.visibility === "Public" ? "Private" : "Public",
                  }))
                }
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition ${
                  filters.visibility === "Public"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-gray-500/10 border-gray-500/30 text-gray-400"
                }`}
              >
                <span>{filters.visibility === "Public" ? "🌍" : "🔒"}</span>
                {filters.visibility}
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Ideas ── */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase text-center mb-3">
            Quick Ideas:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_IDEAS.map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => handleQuickIdea(label)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full border transition ${
                  inputValue === label
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                    : "bg-white/[0.04] border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-white"
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── OR Buttons ── */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-gray-600 text-sm">OR:</span>
          <button
            onClick={() => {
              if (!requireAuthAction()) return;
              if (generating) return;

              setShowImport(true);
            }}
            title={!isAuthenticated ? "Login to use this feature" : ""}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition
    ${
      !isAuthenticated
        ? "opacity-60 cursor-not-allowed bg-blue-500/10 text-blue-300 border border-blue-500/20"
        : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
    }
  `}
          >
            <Link2 className="w-3.5 h-3.5" />
            Import from URL
          </button>
          <button
            onClick={() => {
              if (!requireAuthAction()) return;

              navigate("/recipes/create?from=generate");
            }}
            title={!isAuthenticated ? "Login to create recipes" : ""}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition
    ${
      !isAuthenticated
        ? "opacity-60 cursor-not-allowed bg-purple-500/10 text-purple-300 border border-purple-500/20"
        : "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
    }
  `}
          >
            <PenLine className="w-3.5 h-3.5" />
            Create Manually
          </button>
        </div>

        {/* ── Loading State ── */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" />
              <div className="absolute inset-1 rounded-full border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <ChefHat className="absolute inset-0 m-auto w-6 h-6 text-orange-400" />
            </div>
            <p className="text-gray-400 text-sm animate-pulse">
              Crafting your recipe...
            </p>
          </div>
        )}

        {/* ── Recipe Result ── */}
        {generatedRecipe && !generating && (
          <div ref={resultRef}>
            <RecipeResult
              recipe={generatedRecipe}
              cached={wasCached}
              onSave={handleSave}
              onRegenerate={handleRegenerate}
              onRefined={handleRefined}
              saving={saving}
              isAuthenticated={isAuthenticated}
              onAuthRequired={requireAuth}
            />
          </div>
        )}
      </div>
      {/* Import URL Modal */}
      {showImport && <ImportURLModal onClose={() => setShowImport(false)} />}
    </div>
  );
};

export default RecipeGenerator;
