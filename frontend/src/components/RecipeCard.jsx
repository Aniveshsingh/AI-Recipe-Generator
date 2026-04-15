import { Link, useNavigate } from "react-router-dom";
import { ChefHat, Clock, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RecipeCard = ({
  recipe,
  mode = "private", // "private" | "public"
  onDelete,
  onRequireAuth,
}) => {
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
      className=" relative bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group cursor-pointer"
    >
      {/* Image */}
      <div className="h-48 bg-emerald-100 flex items-center justify-center">
        <ChefHat className="w-16 h-16 text-emerald-600" />
      </div>

      {/* Content */}
      <div className="p-5">
        {mode === "private" ? (
          <Link to={`/recipes/${recipe.id}`} className="block mb-3">
            <h3 className="font-semibold text-lg group-hover:text-emerald-600">
              {recipe.name}
            </h3>
          </Link>
        ) : (
          <h3 className="font-semibold text-lg group-hover:text-emerald-600">
            {recipe.name}
          </h3>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime} mins</span>
          </div>
          {recipe.calories && <span>{recipe.calories} cal</span>}
        </div>

        {/* Public hint */}
        {mode === "public" && !user && (
          <p className="text-xs text-emerald-500 mb-3">
            Login to view full recipe
          </p>
        )}

        {/* Actions */}
        {mode === "private" && (
          <div className="flex gap-2 pt-4 border-t">
            <Link
              to={`/recipes/${recipe.id}`}
              className="flex-1 bg-emerald-500 text-white text-center py-2 rounded-lg text-sm"
            >
              View Recipe
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(recipe.id);
              }}
              className="px-3 py-2 border hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {mode === "public" && !user && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <p className="text-sm font-medium text-emerald-600">
            Login to unlock
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
