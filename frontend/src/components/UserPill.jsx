import { Coins, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const UserPill = () => {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    console.log("logoutCalled");
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className=" inline-flex items-center gap-2 pl-2 pr-5 h-11 rounded-full bg-[#0F828C] text-white font-semibold shadow-md hover:scale-105 transition"
      >
        <div className="rounded-full flex justify-center items-center bg-blue-100 text-blue-600 w-7 h-7">
          {user?.name?.[0]?.toUpperCase() || "U"}
          {/* <User /> */}
        </div>

        <div className="min-w-0">
          <span className="block max-w-[50px] truncate whitespace-nowrap overflow-hidden">
            {" "}
            {user?.name || "User"}{" "}
          </span>
          {/* <span className="text-xs">{user?.credits}</span> */}
          <div className="flex gap-1 absolute -bottom-2 -right-1 text-[10px]  px-1.5 py-[2px] rounded-full border border-orange-500/20 bg-black text-orange-300 font-bold">
            <Coins className="w-3.5 h-3.5" /> {user?.credits}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute -right-2 mt-3  w-56 rounded-2xl backdrop-blur-xl bg-[#050816] border border-white/40 shadow-xl overflow-hidden transition-all duration-300 ${
          menuOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="text-white font-medium truncate">{user?.name}</p>
          <p className="text-sm flex items-center gap-1 text-orange-300">
            <Coins size={14} />
            Credits left today- {user?.credits}
          </p>
        </div>

        <button
          onClick={() => {
            navigate("/dashboard");
            setMenuOpen(false);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
        >
          <User className="w-4 h-4" />
          Dashboard
        </button>

        <Link
          to="/settings"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        <button
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserPill;
