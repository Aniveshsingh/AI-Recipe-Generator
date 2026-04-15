import { useState } from "react";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard"; // your extracted one
import { Sparkles, ChefHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const dummyRecipes = [
  {
    id: "1",
    name: "Paneer Protein Bowl",
    cook_time: 25,
    calories: 520,
  },
  {
    id: "2",
    name: "Chicken Quinoa Salad",
    cook_time: 20,
    calories: 450,
  },
  {
    id: "3",
    name: "Vegan Lentil Curry",
    cook_time: 30,
    calories: 400,
  },
  {
    id: "4",
    name: "Oats Banana Smoothie",
    cook_time: 10,
    calories: 300,
  },
  {
    id: "5",
    name: "Egg Avocado Toast",
    cook_time: 15,
    calories: 350,
  },
  {
    id: "6",
    name: "Tofu Stir Fry",
    cook_time: 20,
    calories: 420,
  },
];

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Cook smarter. Eat better.
          </h1>

          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            Generate AI-powered recipes or analyze your meals to discover
            missing nutrients and improve your diet.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Generate Recipe
            </button>

            <button className="border border-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100">
              Explore Recipes
            </button>
          </div>
        </div>

        {/* FEATURE CARDS (reuse dashboard style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Generate Recipe</h3>
                <p className="text-sm text-emerald-800">
                  Create AI-powered meals instantly
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Analyze Meals
                </h3>
                <p className="text-sm text-gray-600">
                  Discover missing nutrients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RECIPES PREVIEW */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Explore Recipes
          </h2>
          <p className="text-gray-600 mb-6">
            Discover what you can generate with AI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                mode="public"
                onRequireAuth={() => setIsModalOpen(true)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80">
            <h2 className="text-lg font-semibold mb-3">Unlock AI Features</h2>

            <ul className="text-sm text-gray-600 mb-4">
              <li>• Generate unlimited recipes</li>
              <li>• Analyze your meals</li>
              <li>• Track your nutrition</li>
            </ul>

            <div className="flex gap-3">
              <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg w-full">
                Login
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="border px-4 py-2 rounded-lg w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
