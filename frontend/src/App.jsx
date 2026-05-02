import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import LandingLayout from "./Layouts/LandingLayout";
import AppLayout from "./Layouts/AppLayout";

// Public Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import Explore from "./pages/Explore";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import Pantry from "./pages/Pantry";
import RecipeGenerator from "./pages/RecipeGenerator";
import MyRecipes from "./pages/MyRecipes";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import CreateRecipe from "./pages/CreateRecipe";
import CookingMode from "./pages/CookingMode";
import ShoppingList from "./pages/ShoppingList";
import Settings from "./pages/Settings";
import MealPlanner from "./pages/MealPlanner";
import ImportURLModal from "./components/ImportUrl";
import GenerateWrapper from "./Layouts/GenerateWrapper";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_URL}/health`).catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🌍 LANDING LAYOUT */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            {/* <Route path="/generate" element={<RecipeGenerator />} /> */}
          </Route>

          {/* 🔐 AUTH (no navbar) */}
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> */}

          {/* 🚀 APP LAYOUT (protected) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/recipes" element={<MyRecipes />} />
            <Route path="/recipes/create" element={<CreateRecipe />} />
            {/* <Route path="/recipes/import" element={<ImportURLModal />} /> */}
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/:id/edit" element={<EditRecipe />} />
            <Route path="/recipes/:id/cook" element={<CookingMode />} />
            <Route path="/meal-plan" element={<MealPlanner />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/generate" element={<GenerateWrapper />} />
          {/* 🔁 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* 🔔 Toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111827",
            color: "#f3f4f6",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
