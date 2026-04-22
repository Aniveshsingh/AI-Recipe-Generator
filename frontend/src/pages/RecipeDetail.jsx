import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Printer,
  ShoppingCart,
  Globe,
  Lock,
  Pencil,
  Trash2,
  Play,
  Clock,
  Users,
  Flame,
  ChefHat,
  CheckCircle2,
  Circle,
  Sparkles,
  MessageCircle,
  Send,
  BookmarkPlus,
  RotateCcw,
  FileText,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [privateNote, setPrivateNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [addingToList, setAddingToList] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/recipes/${id}`);
        const data = await res.json();
        if (!data || data.message) {
          toast.error("Recipe not found");
          navigate("/recipes");
          return;
        }
        console.log(data);
        setRecipe(data);
        setPrivateNote(data.user_notes || "");
      } catch {
        toast.error("Failed to load recipe");
        navigate("/recipes");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this recipe permanently?")) return;
    try {
      await apiFetch(`/recipes/${id}`, { method: "DELETE" });
      toast.success("Recipe deleted");
      navigate("/recipes");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handlePrint = () => window.print();

  const handleAddToList = async () => {
    if (!recipe?.ingredients?.length) return;
    try {
      setAddingToList(true);
      await Promise.all(
        recipe.ingredients.map((ing) =>
          apiFetch("/shoppingList", {
            method: "POST",
            body: JSON.stringify({
              ingredient_name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              category: "Other",
              is_checked: false,
              from_meal_plan: false,
            }),
          }),
        ),
      );
      toast.success("All ingredients added to shopping list!");
    } catch {
      toast.error("Failed to add to list");
    } finally {
      setAddingToList(false);
    }
  };

  const handleTogglePublic = async () => {
    const newVisibility =
      recipe.visibility === "Private" ? "Public" : "Private";
    try {
      await apiFetch(`/recipes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...recipe, visibility: newVisibility }),
      });
      setRecipe((prev) => ({ ...prev, visibility: newVisibility }));
      toast.success(`Recipe set to ${newVisibility}`);
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleSaveNote = async () => {
    try {
      setSavingNote(true);
      await apiFetch(`/recipes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...recipe, user_notes: privateNote }),
      });
      toast.success("Note saved!");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const toggleIngredient = (i) => {
    const s = new Set(checkedIngredients);
    s.has(i) ? s.delete(i) : s.add(i);
    setCheckedIngredients(s);
  };

  const toggleStep = (i) => {
    const s = new Set(completedSteps);
    s.has(i) ? s.delete(i) : s.add(i);
    setCompletedSteps(s);
  };

  const handleRegenerate = () => {
    if (recipe?.user_notes) {
      navigate(`/generate?prompt=${encodeURIComponent(recipe.user_notes)}`);
    } else {
      navigate("/generate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) return null;

  const isPublic = recipe.visibility !== "Private";
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Navbar />

      {/* ── Top Action Bar ── */}
      <div className="sticky top-16 z-30 bg-[#0b0b0c]/80 backdrop-blur-md  border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/recipes")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <ActionBtn
              icon={<Share2 className="w-3.5 h-3.5" />}
              label="Share"
              onClick={handleShare}
            />
            <ActionBtn
              icon={<Printer className="w-3.5 h-3.5" />}
              label="Print"
              onClick={handlePrint}
            />
            <ActionBtn
              icon={<ShoppingCart className="w-3.5 h-3.5" />}
              label={addingToList ? "Adding..." : "Add to List"}
              onClick={handleAddToList}
              disabled={addingToList}
            />
            <ActionBtn
              icon={
                isPublic ? (
                  <Globe className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )
              }
              label={isPublic ? "Public" : "Private"}
              onClick={handleTogglePublic}
              active={isPublic}
            />
            <ActionBtn
              icon={<Pencil className="w-3.5 h-3.5" />}
              label="Edit"
              onClick={() => navigate(`/recipes/${id}/edit`)}
            />
            <ActionBtn
              icon={<Trash2 className="w-3.5 h-3.5" />}
              label="Delete Recipe"
              onClick={handleDelete}
              danger
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Hero Image ── */}
        {recipe.image ? (
          <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-6">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : recipe.source_url ? (
          <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-white/5 flex flex-col items-center justify-center gap-3 mb-6">
            {/* 🔗 Link pill */}
            <span className="text-3xl md:text-4xl font-bold text-white">
              Imported From
            </span>
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 transition max-w-[90%]"
            >
              {/* Icon */}
              <svg
                className="w-4 h-4 text-orange-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 4" />
                <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L14 20" />
              </svg>

              {/* Truncated URL */}
              <span className="truncate">
                {new URL(recipe.source_url).hostname}
              </span>
            </a>

            {/* <ChefHat className="w-12 h-12 text-orange-500/20" /> */}
          </div>
        ) : (
          <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-6">
            <ChefHat className="w-16 h-16 text-orange-500/20" />
          </div>
        )}

        {/* ── Recipe Header ── */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8 mb-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.difficulty && (
              <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-gray-300 uppercase font-semibold tracking-wide">
                {recipe.difficulty}
              </span>
            )}
            <span
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wide ${
                isPublic
                  ? "border-emerald-500/30 text-emerald-400"
                  : "border-gray-500/30 text-gray-400"
              }`}
            >
              {isPublic ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {isPublic ? "Public to Community" : "Private"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {recipe.name}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.cuisine_type && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {recipe.cuisine_type}
              </span>
            )}
            {recipe.meal_type && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {recipe.meal_type}
              </span>
            )}
          </div>

          {/* Author */}
          {user && (
            <p className="text-sm text-gray-500 mb-2">
              by{" "}
              <span className="text-gray-300 font-medium">
                {user.name || user.email}
              </span>
            </p>
          )}

          {/* Generated from prompt */}
          {recipe.generated_prompt && (
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500/50" />
              Generated from prompt:{" "}
              <span className="text-gray-400 italic">
                {recipe.generated_prompt}
              </span>
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-5 border-t border-b border-white/5 my-5">
            <Stat
              label="MIN PREP"
              value={recipe.prep_time || 0}
              icon={<Clock className="w-4 h-4 text-orange-400" />}
            />
            <Stat
              label="MIN COOK"
              value={recipe.cook_time || 0}
              icon={<Flame className="w-4 h-4 text-orange-400" />}
            />
            <Stat
              label="SERVINGS"
              value={recipe.servings || 0}
              icon={<Users className="w-4 h-4 text-orange-400" />}
            />
            <Stat
              label="DIFFICULTY"
              value={recipe.difficulty || "—"}
              capitalize
            />
            <Stat
              label="STEPS"
              value={recipe.instructions?.length || 0}
              icon={<ChefHat className="w-4 h-4 text-orange-400" />}
            />
          </div>

          {/* Start Cooking */}
          <button
            onClick={() => navigate(`/recipes/${id}/cook`)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20"
          >
            <Play className="w-4 h-4" />
            Start 360° Cooking Mode
          </button>
        </div>

        {/* ── Ingredients + Instructions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          {/* Ingredients */}
          <div className="lg:col-span-2 bg-[#111827] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2 text-lg">
              🧂 Ingredients
            </h2>
            <p className="text-gray-600 text-xs mb-4">
              Tap to check off what you have.
            </p>
            <div className="space-y-1">
              {recipe.ingredients?.map((ing, i) => {
                const checked = checkedIngredients.has(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleIngredient(i)}
                    className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 cursor-pointer group"
                  >
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 shrink-0 group-hover:text-gray-400 transition" />
                    )}
                    <span
                      className={`text-sm font-semibold tabular-nums shrink-0 ${checked ? "text-gray-600 line-through" : "text-orange-400"}`}
                    >
                      {ing.quantity} {ing.unit}
                    </span>
                    <span
                      className={`text-sm ${checked ? "text-gray-600 line-through" : "text-gray-300"}`}
                    >
                      {ing.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 mt-3 text-right">
              {checkedIngredients.size} / {recipe.ingredients?.length || 0}{" "}
              ready
            </p>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-3 bg-[#111827] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1 flex items-center gap-2 text-lg">
              👨‍🍳 Instructions
            </h2>
            <p className="text-gray-600 text-xs mb-4">
              Tap a step to mark it complete.
            </p>
            <div className="space-y-3">
              {recipe.instructions?.map((step, i) => {
                const done = completedSteps.has(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition ${done ? "opacity-50" : "hover:bg-white/5"}`}
                  >
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <p
                      className={`text-sm leading-relaxed ${done ? "line-through text-gray-600" : "text-gray-300"}`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Chef's Note ── */}
        {(recipe.chef_note || recipe.chefNote) && (
          <div className="bg-[#111827] border-l-2 border-orange-500/60 border border-white/10 rounded-2xl p-6 mb-5">
            <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-2">
              Chef's Note
            </p>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              {recipe.chef_note || recipe.chefNote}
            </p>
          </div>
        )}

        {/* ── Generated From Prompt ── */}
        {recipe.generated_prompt && (
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-5">
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
              Generated From Prompt
            </p>
            <p className="text-gray-300 text-sm italic mb-4">
              "{recipe.generated_prompt}"
            </p>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 text-sm text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate variation
            </button>
          </div>
        )}

        {/* ── Private Remarks ── */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            Private Remarks
          </h3>
          <p className="text-gray-600 text-xs mb-3">
            Only you can see these notes.
          </p>
          <textarea
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            placeholder="Jot down your tweaks, substitutions, or memories..."
            rows={4}
            className="w-full bg-[#0d1117] border border-white/10 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-orange-500/40 placeholder-gray-700 transition resize-none font-mono"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="flex items-center gap-1.5 text-sm text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              ✓ {savingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>

        {/* ── Community Comments ── */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple-400" />
            Community Comments
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this recipe?"
              className="flex-1 bg-[#0d1117] border border-white/10 text-gray-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-purple-500/40 placeholder-gray-700 transition"
            />
            <button
              onClick={() => {
                if (!comment.trim()) return;
                setComments((prev) => [
                  ...prev,
                  {
                    text: comment,
                    user: user?.name || "You",
                    time: "Just now",
                  },
                ]);
                setComment("");
              }}
              className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-xl transition"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
                    {c.user[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {c.user} · {c.time}
                    </p>
                    <p className="text-sm text-gray-300">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm text-center py-4">
              No comments yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick, active, danger, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-50 ${
      danger
        ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
        : active
          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    {icon}
    {label}
  </button>
);

const Stat = ({ label, value, icon, capitalize }) => (
  <div className="text-center">
    <div
      className={`text-xl font-bold text-white ${capitalize ? "capitalize" : ""}`}
    >
      {value}
    </div>
    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
      {icon}
      {label}
    </div>
  </div>
);

export default RecipeDetail;
