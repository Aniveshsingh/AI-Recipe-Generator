// GenerateWrapper.jsx
import { useAuth } from "../context/AuthContext";
import LandingLayout from "./LandingLayout";
import AppLayout from "./AppLayout";
import RecipeGenerator from "../pages/RecipeGenerator";

const GenerateWrapper = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <AppLayout>
        <RecipeGenerator />
      </AppLayout>
    );
  }

  return (
    <LandingLayout>
      <RecipeGenerator />
    </LandingLayout>
  );
};

export default GenerateWrapper;
