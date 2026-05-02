import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChefHat,
  Home,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  LogIn,
  CookingPot,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import UserPill from "./UserPill";

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // const isAuthenticated = !!user;

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);

    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const privateLinks = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Pantry",
      to: "/pantry",
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      label: "Generate",
      to: "/generate",
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      label: "Recipes",
      to: "/recipes",
      icon: <CookingPot className="w-4 h-4" />,
    },
    // {u
    //   label: "Meal Plan",
    //   to: "/meal-plan",
    //   icon: <Calendar className="w-4 h-4" />,
    // },
    {
      label: "Shopping",
      to: "/shopping-list",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="bg-[#050816]/80 backdrop-blur-md border-b border-white/10 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-white"
          >
            <div className="w-12 h-12 bg-emerald-500/10 flex justify-center items-center rounded-md">
              <ChefHat className="text-emerald-500 stroke-2 size-10" />
            </div>
            SmartChef<span className="text-emerald-500">AI</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-2 py-1">
            {/* Public */}
            {/* {publicLinks.map((link) => (
              <NavLink key={link.to} {...link} active={isActive(link.to)} />
            ))} */}

            {/* Private */}

            {isAuthenticated &&
              privateLinks.map((link) => (
                <NavLink key={link.to} {...link} active={isActive(link.to)} />
              ))}
          </div>

          {/* User Section */}
          <div className="relative flex items-center gap-3">
            {isAuthenticated ? (
              <UserPill />
            ) : (
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }) => {
  return (
    <Link to={to}>
      <div
        className={`flex md:flex-row flex-col items-center gap-1 px-4 py-1.5 rounded-full text-sm transition
        ${
          active
            ? "md:bg-[#0F828C]/50 text-white shadow-md"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <span
          className={`p-2 rounded-full md:p-0 ${
            active
              ? "bg-emerald-500 md:bg-transparent text-white"
              : "text-gray-400"
          }`}
        >
          {icon}
        </span>
        <span className="hidden md:inline">{label}</span>
      </div>
    </Link>
  );
};

export const MobileNavbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 flex gap-6 justify-center bg-[#050816] border border-white/15 p-4 md:hidden">
      <NavItem
        to="/dashboard"
        icon={<LayoutDashboard />}
        active={isActive("/dashboard")}
      />
      <NavItem
        to="/pantry"
        icon={<UtensilsCrossed />}
        active={isActive("/pantry")}
      />
      <NavItem
        to="/generate"
        icon={<ChefHat />}
        active={isActive("/generate")}
      />
      {/* <NavItem
        to="/meal-plan"
        icon={<Calendar />}
        active={isActive("/meal-plan")}
      /> */}
      <NavItem
        to="/recipes"
        icon={<CookingPot />}
        active={isActive("/recipes")}
      />
      <NavItem
        to="/shopping-list"
        icon={<ShoppingCart />}
        active={isActive("/shopping-list")}
      />
    </div>
  );
};

const NavItem = ({ to, icon, active }) => (
  <Link to={to}>
    <div
      className={`p-2 rounded-full ${active ? "bg-[#0F828C] text-white" : "text-gray-400"}`}
    >
      {icon}
    </div>
  </Link>
);
