import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Bell,
  Mic,
  MicOff,
  CheckCircle2,
  Circle,
  Users,
  ChefHat,
} from "lucide-react";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";

// ─── Mise en Place Screen ─────────────────────
const MiseEnPlace = ({ recipe, onStart }) => {
  const [servings, setServings] = useState(recipe.servings || 2);
  const [baseServings] = useState(recipe.servings || 2);
  const [checked, setChecked] = useState(new Set());

  const ratio = servings / baseServings;

  const scaleQty = (qty) => {
    const scaled = qty * ratio;
    return Number.isInteger(scaled) ? scaled : parseFloat(scaled.toFixed(1));
  };

  const toggleCheck = (i) => {
    const s = new Set(checked);
    s.has(i) ? s.delete(i) : s.add(i);
    setChecked(s);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-10 pb-6 px-4">
        <h1 className="text-2xl font-bold text-white mb-1">Chef's Prep Zone</h1>
        <p className="text-gray-500 text-sm">
          Gather and prep your ingredients before the Flame.
        </p>
      </div>

      {/* Servings control */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-6">
        <div className="bg-[#111827] border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Servings</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition"
            >
              −
            </button>
            <span className="text-white font-bold text-lg w-8 text-center">
              {servings}
            </span>
            <button
              onClick={() => setServings(servings + 1)}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition"
            >
              +
            </button>
            {servings !== baseServings && (
              <button
                onClick={() => setServings(baseServings)}
                className="text-xs text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full ml-1 hover:bg-orange-500/10 transition"
              >
                ×{(servings / baseServings).toFixed(1)} · Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients checklist */}
      <div className="max-w-2xl mx-auto w-full px-4 flex-1 overflow-y-auto pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recipe.ingredients?.map((ing, i) => {
            const isChecked = checked.has(i);
            return (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  isChecked
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-[#111827] border-white/10 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-600"
                  }`}
                >
                  {isChecked && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${isChecked ? "text-emerald-400 line-through" : "text-orange-400"}`}
                  >
                    {scaleQty(ing.quantity)} {ing.unit}
                  </p>
                  <p
                    className={`text-sm ${isChecked ? "text-gray-600 line-through" : "text-gray-300"}`}
                  >
                    {ing.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip & Start */}
      <div className="fixed bottom-13 left-0 right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-[#0b0b0c] to-transparent">
        <button
          onClick={onStart}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-orange-500/30 transition text-sm"
        >
          Skip & Start Cooking 🍳
        </button>
      </div>
    </div>
  );
};

// ─── Step Screen ──────────────────────────────
const StepScreen = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const totalSteps = recipe.instructions?.length || 0;
  const step = recipe.instructions?.[currentStep] || "";
  const progress = (currentStep / totalSteps) * 100;

  // Timer
  useEffect(() => {
    if (!timerRunning || timerSeconds === null) return;
    if (timerSeconds <= 0) {
      setTimerRunning(false);
      toast.success("Timer done! 🔔");
      return;
    }
    const t = setTimeout(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerSeconds]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const fetchTip = async () => {
    if (tip) {
      setShowTip((s) => !s);
      return;
    }
    try {
      setLoadingTip(true);
      setShowTip(true);
      const res = await apiFetch("/ai/cooking-tip", {
        method: "POST",
        body: JSON.stringify({
          recipeName: recipe.name,
          step: step,
          stepNumber: currentStep + 1,
          totalSteps,
        }),
      });
      const data = await res.json();
      setTip(data.tip || "No tip available for this step.");
    } catch {
      setTip(
        "Focus on the visual cues — color, aroma, and texture tell you more than a timer.",
      );
    } finally {
      setLoadingTip(false);
    }
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      setShowTip(false);
      setTip("");
    } else {
      onClose("done");
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setShowTip(false);
      setTip("");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070b14] text-white flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => onClose("exit")}
          className="text-gray-500 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 mx-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-orange-400 text-xs font-bold tracking-wide whitespace-nowrap">
              STEP {currentStep + 1} / {totalSteps}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const secs = prompt("Set timer (seconds):");
              if (secs && !isNaN(secs)) {
                setTimerSeconds(parseInt(secs));
                setTimerRunning(true);
              }
            }}
            className="text-gray-500 hover:text-white transition relative"
          >
            <Bell className="w-4 h-4" />
            {timerRunning && timerSeconds !== null && (
              <span className="absolute -top-2 -right-2 text-[9px] text-orange-400 font-bold">
                {formatTime(timerSeconds)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 px-6 py-2">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition shadow-lg shadow-orange-500/30"
        >
          {currentStep === totalSteps - 1 ? "Finish 🎉" : "Next Step"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-2xl md:text-4xl font-semibold text-white leading-relaxed max-w-2xl mb-8">
          {step}
        </p>

        {/* Chef's tip toggle */}
        <button
          onClick={fetchTip}
          className="flex items-center gap-2 text-sm text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full transition mb-4"
        >
          💡 {showTip ? "Hide Tip" : "Chef's Tip"}
        </button>

        {/* Tip card */}
        {showTip && (
          <div className="max-w-xl w-full bg-[#0d1117] border-l-2 border-emerald-500 border border-white/10 rounded-xl p-4 text-left">
            {loadingTip ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-4 h-4 border border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin" />
                Thinking...
              </div>
            ) : (
              <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Done Screen ──────────────────────────────
const DoneScreen = ({ recipe, onBack }) => (
  <div className="fixed inset-0 bg-[#070b14] text-white flex flex-col items-center justify-center z-50 text-center px-6">
    <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-orange-500/30 flex items-center justify-center mb-6">
      <ChefHat className="w-10 h-10 text-emerald-400" />
    </div>
    <h1 className="text-4xl font-bold text-white mb-3">Bon Appétit! 🎉</h1>
    <p className="text-gray-400 text-lg mb-8">
      You have successfully completed <br />
      <span className="text-white font-semibold">{recipe.name}</span>
    </p>
    <button
      onClick={onBack}
      className="bg-emerald-500 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg shadow-orange-500/20"
    >
      Back to Recipe
    </button>
  </div>
);

// ─── Main CookingMode ─────────────────────────
const CookingMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("prep"); // prep | cooking | done

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await apiFetch(`/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch {
        toast.error("Failed to load recipe");
        navigate(`/recipes/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) return null;

  if (stage === "done")
    return (
      <DoneScreen recipe={recipe} onBack={() => navigate(`/recipes/${id}`)} />
    );
  if (stage === "cooking") {
    return (
      <StepScreen
        recipe={recipe}
        onClose={(result) => {
          if (result === "done") setStage("done");
          else navigate(`/recipes/${id}`);
        }}
      />
    );
  }

  return <MiseEnPlace recipe={recipe} onStart={() => setStage("cooking")} />;
};

export default CookingMode;
