import { ChefHat, Home, Sparkles, Vault, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import UserPill from "./UserPill";

const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4">{children}</div>
);

export const LandingNavbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#050816] backdrop-blur-xl text-white border-b border-white/10">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-12 h-12 bg-emerald-500/10 flex justify-center items-center rounded-md">
              <ChefHat className="text-emerald-500 size-10" />
            </div>
            SmartChef<span className="text-emerald-500">AI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-2 py-1">
            {isAuthenticated && (
              <NavItem
                icon={<Home size={14} />}
                text="Dashboard"
                active={isActive("/dashboard")}
                to="/dashboard"
              />
            )}

            <NavItem
              icon={<Home size={14} />}
              text="Home"
              active={isActive("/")}
              to="/"
            />

            <NavItem
              icon={<Sparkles size={14} />}
              text="Generator"
              active={isActive("/generate")}
              to="/generate"
            />

            {/* <NavItem
              icon={<Vault size={14} />}
              text="Explore"
              active={isActive("/explore")}
              to="/explore"
            /> */}
          </div>

          {/* Avatar placeholder */}
          {isAuthenticated ? (
            <UserPill />
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F828C] hover:bg-emerald-600 text-white rounded-lg transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </Container>
    </div>
  );
};

const NavItem = ({ icon, text, active, onClick, to }) => (
  <Link to={to}>
    <div
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center gap-1 px-4 py-1.5 rounded-full text-sm transition
        ${active ? "md:bg-[#0F828C]/25 text-white shadow-md" : "text-gray-400 hover:text-white"}
      `}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  </Link>
);

const MobileNavItem = ({ icon, text, active, onClick, to }) => (
  <Link to={to}>
    <div onClick={onClick} className="flex flex-col items-center px-4">
      <span
        className={`px-3 py-1  rounded-xl ${active ? "bg-emerald-500/40 text-white " : "text-gray-400"}`}
      >
        {icon}
      </span>
      <span className="text-white text-sm">{text}</span>
    </div>
  </Link>
);

export const LandingMobileNavbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 flex justify-center bg-[#050816] p-4 md:hidden">
      <MobileNavItem
        icon={<Home size={20} />}
        text="Home"
        active={isActive("/")}
        to="/"
      />

      <MobileNavItem
        icon={<Sparkles size={20} />}
        text="Generator"
        active={isActive("/generate")}
        to="/generate"
      />

      {/* <MobileNavItem
        icon={<Vault size={20} />}
        text="Explore"
        active={isActive("/explore")}
        to="/explore"
      /> */}
    </div>
  );
};
