import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChefHat,
  Home,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAuthenticated = !!user;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-xl font-semibold text-gray-900"
          >
            <ChefHat className="w-7 h-7 text-emerald-500" />
            <span>AI Recipe Generator</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  icon={<Home className="w-4 h-4" />}
                  label="Dashboard"
                />
                <NavLink
                  to="/pantry"
                  icon={<UtensilsCrossed className="w-4 h-4" />}
                  label="Pantry"
                />
                <NavLink
                  to="/generate"
                  icon={<ChefHat className="w-4 h-4" />}
                  label="Generate"
                />
                <NavLink
                  to="/recipes"
                  icon={<UtensilsCrossed className="w-4 h-4" />}
                  label="Recipes"
                />
                <NavLink
                  to="/meal-plan"
                  icon={<Calendar className="w-4 h-4" />}
                  label="Meal Plan"
                />
                <NavLink
                  to="/shopping-list"
                  icon={<ShoppingCart className="w-4 h-4" />}
                  label="Shopping"
                />
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-2 text-sm text-gray-700 hover:text-emerald-600"
                >
                  Home
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg"
                >
                  Login
                </button>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/settings"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
