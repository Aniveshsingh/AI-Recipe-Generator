// RecipeCard component
import { Link, useNavigate } from "react-router-dom";
import { ChefHat, Clock, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RecipeCard = ({ recipe, mode = "private", onDelete, onRequireAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const handleClick = () => {
    if (mode === "public" && !user) {
      onRequireAuth?.();
      return;
    }
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <div
      onClick={mode === "public" ? handleClick : undefined}
      className="group relative card-dark overflow-hidden transition hover:shadow-xl cursor-pointer"
    >
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-purple-500/10 to-orange-500/10 flex items-center justify-center">
        <ChefHat className="w-12 h-12 text-orange-500 group-hover:text-white transition" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        {mode === "private" ? (
          <Link to={`/recipes/${recipe.id}`} className="block mb-2">
            <h3 className="font-semibold text-lg text-white group-hover:text-orange-400 transition">
              {recipe.name}
            </h3>
          </Link>
        ) : (
          <h3 className="font-semibold text-lg text-white group-hover:text-orange-400 transition">
            {recipe.name}
          </h3>
        )}

        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime} mins</span>
          </div>
          {recipe.calories && <span>{recipe.calories} cal</span>}
        </div>

        {/* Public hint */}
        {mode === "public" && !user && (
          <p className="text-xs text-gray-500 mb-3">Login to unlock</p>
        )}

        {/* Actions */}
        {mode === "private" && (
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Link
              to={`/recipes/${recipe.id}`}
              className="flex-1 btn-primary text-center text-sm"
            >
              View
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(recipe.id);
              }}
              className="px-3 py-2 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 🔒 Overlay (public mode) */}
      {mode === "public" && !user && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <p className="text-sm font-medium text-white">Login to unlock</p>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
