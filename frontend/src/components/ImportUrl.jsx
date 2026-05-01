import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useState } from "react";
import { Clock, Link2, Users } from "lucide-react";

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

  // const domain = url
  //   ? (() => {
  //       try {
  //         return new URL(url).hostname.replace("www.", "");
  //       } catch {
  //         return url;
  //       }
  //     })()
  //   : "";

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
                  className="flex items-center gap-1.5 border border-orange-500/40 text-orange-500 hover:bg-orange-600 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Import
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

export default ImportURLModal;
