import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../utils/api";

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // or use your updateUser if needed

  return (
    <div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await apiFetch("/auth/google", {
              method: "POST",
              body: JSON.stringify({
                token: credentialResponse.credential,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              toast.error(data.message || "Google login failed");
              return;
            }

            // store your JWT
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user); // or updateUser(data.user)
            toast.success("Logged in with Google");
            navigate("/generate");
          } catch (err) {
            toast.error("Something went wrong");
            console.log(err);
          }
        }}
        onError={() => toast.error("Google login failed")}
      />
    </div>
  );
};

export default GoogleAuthButton;
