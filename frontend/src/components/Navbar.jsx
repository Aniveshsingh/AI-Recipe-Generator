// Navbar component
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
  LogIn,
  Menu,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);

    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);
  const isAuthenticated = !!user;

  return (
    <nav className="bg-[#0b0b0c]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-lg font-semibold text-white"
          >
            <ChefHat className="w-6 h-6 text-orange-500" />
            <span>AI Recipe Generator</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
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
                {/* <button
                  onClick={() => navigate("/")}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white transition"
                >
                  Home
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
                >
                  Login
                </button> */}
                <>
                  <NavLink
                    to="/"
                    icon={<Home className="w-4 h-4" />}
                    label="Home"
                  />
                  <NavLink
                    to="/pantry"
                    icon={<UtensilsCrossed className="w-4 h-4" />}
                    label="Grocery"
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
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* 🔥 Avatar Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="relative inline-flex items-center justify-start gap-2 pl-2 pr-5  h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500  text-white font-semibold shadow-md hover:scale-105 transition"
                >
                  <div className="rounded-full flex justify-center items-center bg-black text-white w-8 h-8 ">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="">
                    {user?.name || "User"}
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-black text-white px-1.5 py-[2px] rounded-full border border-white/10">
                      {user?.credits}
                      {console.log("user", user)}
                    </span>
                  </div>

                  {/* 🔥 Credits Badge */}
                </button>

                {/* 🔥 Dropdown */}
                <div
                  className={`absolute right-0 top-14 w-56 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl overflow-hidden z-50 transition-all duration-300 ${
                    menuOpen
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }`}
                >
                  {/* Profile Info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="text-white font-medium truncate">
                      {user?.name || "User"}
                    </p>
                  </div>

                  {/* Profile */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  {/* Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">SignIn</span>
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
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
