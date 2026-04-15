import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, ChefHat, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
// import { dummyRecipes } from "../data/dummyData";
import { apiFetch } from "../utils/api";
import RecipeCard from "../components/RecipeCard.jsx";

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const cuisines = [
    "All",
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
  const difficulties = ["All", "easy", "medium", "hard"];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await apiFetch("/recipes");
        const data = await res.json();

        const formatted = data.map((item) => ({
          ...item,
          id: item._id,
        }));

        setRecipes(formatted);
        setFilteredRecipes(formatted);
      } catch (error) {
        console.error(error);
      }
    };

    // Load dummy recipes
    // setRecipes(dummyRecipes);
    fetchRecipes();
  }, []);

  useEffect(() => {
    const filterRecipes = () => {
      let filtered = [...recipes];

      if (searchQuery) {
        filtered = filtered.filter(
          (recipe) =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()),
        );
      }

      if (selectedCuisine !== "All") {
        filtered = filtered.filter(
          (recipe) => recipe.cuisine_type === selectedCuisine,
        );
      }

      if (selectedDifficulty !== "All") {
        filtered = filtered.filter(
          (recipe) => recipe.difficulty === selectedDifficulty,
        );
      }

      setFilteredRecipes(filtered);
    };

    filterRecipes();
  }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await apiFetch(`/recipes/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
          <p className="text-gray-600 mt-1">Your collection of saved recipes</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Cuisine Filter */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine === "All" ? "All Cuisines" : cuisine}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "All"
                    ? "All Difficulties"
                    : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                mode="private"
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {recipes.length === 0
                ? "No recipes yet"
                : "No recipes match your filters"}
            </p>
            {recipes.length === 0 && (
              <Link
                to="/generate"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Generate Your First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;
