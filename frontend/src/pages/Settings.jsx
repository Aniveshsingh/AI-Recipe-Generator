import { useState, useEffect } from "react";
import { User, Lock, Trash2, Save } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // 🔥 UPDATE PROFILE
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const res = await apiFetch("/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify({ name: profile.name }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 CHANGE PASSWORD
  // const handlePasswordChange = async (e) => {
  //     e.preventDefault();

  //     toast('Password change API not implemented yet');
  // };

  // 🔥 DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    if (!confirm("Delete account?")) return;

    try {
      const res = await apiFetch("/auth/delete-account", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Account deleted");
      logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Profile */}
        <form
          onSubmit={handleProfileUpdate}
          className="bg-white p-6 rounded mb-6"
        >
          <h2 className="font-semibold mb-4">Profile</h2>

          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="border p-2 w-full mb-3"
          />

          <input
            value={profile.email}
            disabled
            className="border p-2 w-full mb-3"
          />

          <button className="bg-emerald-500 text-white px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </form>

        {/* Danger */}
        <div className="bg-white p-6 rounded border border-red-300">
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
