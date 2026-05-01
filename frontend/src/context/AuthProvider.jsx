// Auth Provider
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;
  // auto login when refresh
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        await fetchUser();
      }

      setLoading(false);
    };

    init();
  }, []);

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updatedUser = { ...prev, ...updates };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message };
      }

      //  store token
      localStorage.setItem("token", data.token);

      //  store user
      localStorage.setItem("user", JSON.stringify(data.user));

      //  update state
      setUser(data.user);
      await fetchUser();
      return { success: true };
    } catch (error) {
      console.log(error.message);
      return { success: false, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };
  const register = async (name, email, password) => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message };
      }

      //  auto login after signup
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.log(error.message);
      return { success: false, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Just clear user (no API call)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (err) {
      console.log("Fetch user error:", err.message);
    }
  };
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUser,
    setUser,

    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
