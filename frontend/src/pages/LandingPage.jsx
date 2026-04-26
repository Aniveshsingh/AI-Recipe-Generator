// landing page
import {
  Home,
  Sparkles,
  Vault,
  Compass,
  Brain,
  Image,
  Sliders,
  ChefHat,
  Instagram,
  Twitter,
  Github,
  Facebook,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6  ${className}`}>
    {children}
  </div>
);

export default function Landing() {
  const [activeTab, setActiveTab] = useState("Home");
  const steps = [
    { icon: Sparkles, title: "Tell Us What You Want" },
    { icon: Brain, title: "AI Crafts the Recipe" },
    { icon: Image, title: "Preview Before You Cook" },
    { icon: Sliders, title: "Refine & Personalize" },
    { icon: ChefHat, title: "Cook Step-by-Step" },
  ];

  const featureData = [
    { text: "AI Recipe Generation", icon: "✨" },
    { text: "AI Dish Visualization", icon: "🖼️" },
    { text: "Extended Thinking Model", icon: "🧠" },
    { text: "Personal Recipe Vault", icon: "📦" },
    { text: "Hands-Free Cooking", icon: "🍳" },
    { text: "Integrated Cook Timers", icon: "⏱️" },
    { text: "Community Comments", icon: "💬" },
    { text: "Recipe Remixing & Forks", icon: "🔀" },
    { text: "Cook Completion Badges", icon: "🏅" },
    { text: "Dietary Safety Guardrails", icon: "🛡️" },
    { text: "Smart Grocery List", icon: "🛒" },
    { text: "Personal Remarks & Notes", icon: "📝" },
  ];

  return (
    <div className="relative bg-[#050816] text-white overflow-hidden ">
      {/* 🔥 BACKGROUND */}
      {/* <div
        className="absolute inset-0 -z-10 
        bg-[radial-gradient(circle_at_20%_30%,#ff7a2f22,transparent_40%),
             radial-gradient(circle_at_80%_10%,#3b82f622,transparent_40%),
             radial-gradient(circle_at_50%_90%,#9333ea22,transparent_60%)]"
      /> */}

      {/* ================= NAVBAR ================= */}
      <div className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/[0.03] border-b border-white/10">
        <Container className="">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-3">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <div className="w-12 h-12 bg-emerald-500/10 flex justify-center items-center rounded-md">
                <ChefHat className="text-emerald-500 stroke-2 size-10 " />
              </div>
              SmartChef<span className="text-emerald-500">AI</span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-2 py-1">
              <NavItem
                icon={<Home size={14} />}
                text="Home"
                active={activeTab === "Home"}
                onClick={() => setActiveTab("Home")}
                to="/"
              />
              <NavItem
                icon={<Sparkles size={14} />}
                text="Generator"
                active={activeTab === "Generator"}
                onClick={() => {
                  setActiveTab("Generator");
                }}
                to="/generate"
              />
              <NavItem
                icon={<Vault size={14} />}
                text="My Recipes"
                active={activeTab === "Vault"}
                onClick={() => setActiveTab("Vault")}
                to="/recipes"
              />
              {/* <NavItem
              icon={<Compass size={14} />}
              text="Explore"
              active={activeTab === "Explore"}
              onClick={() => setActiveTab("Explore")}
            /> */}
            </div>

            <div className="w-8 h-8 rounded-full bg-[#FF7A2F] flex items-center justify-center text-sm">
              S
            </div>
          </div>
        </Container>
      </div>

      {/* ================= HERO ================= */}
      <section className="pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            {/* <p className="text-sm text-gray-400 mb-6">
              Extended Thinking AI • AI Image Generation • Smart Grocery List
            </p> */}

            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white">
              Think Less <br />
              <span className="text-emerald-500">Cook Smarter</span> <br />
              Eat Better
            </h1>

            <p className="mt-6 text-gray-400 max-w-lg leading-relaxed">
              SmartChef AI is your advanced Recipe AI Generator and intelligent
              recipes keeper.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap">
              <button className="bg-[#0F828C] px-6 py-3 rounded-xl font-medium shadow-[0_0_30px_rgba(15,130,140,0.4)] hover:scale-105 hover:bg-[#AAFFC7]/60 hover:text-black transition">
                Generate a Recipe
              </button>

              <button className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-[#AAFFC7]/60 hover:text-black transition">
                Resume Cooking
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1684568519320-8c6b14f7e65f"
              className="rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] w-[420px] max-w-full"
            />
          </div>
        </div>
      </section>

      {/* steps cards section */}
      <section className="flex flex-col items-center justify-center gap-4 mt-10">
        <div className="text-center text-4xl text-emerald-500 font-extrabold  ">
          The Flow
        </div>
        <div className="text-center text-2xl text-[#0F828C] font-bold">
          From Idea to Plate in 5 Steps
        </div>
        <div className="grid md:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-white/[0.06] border border-[#0F828C] rounded-2xl  p-10  text-left card-hover glow-border hover:bg-white/[0.08]"
            >
              <div className="flex justify-between items-center">
                {/* ICON */}
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 transition hover:scale-110">
                  <step.icon size={18} />
                </div>

                {/* NUMBER BADGE */}
                <div className=" w-6 h-6 mb-4 text-xs flex items-center justify-center rounded-full bg-[#0F828C] text-white">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                {i === 4 ? (
                  <>
                    <span className="text-emerald-500 font-semibold tracking-wide">
                      SmartChef Mode:
                    </span>{" "}
                    Enter a guided cooking mode with clear instructions, timers,
                    and prep flow — designed for a smooth, hands-on experience.
                  </>
                ) : (
                  [
                    "Share anything — ingredients in your kitchen, a dish idea, or even a mood. The AI interprets context, preferences, and constraints instantly.",
                    "Our model intelligently builds your recipe by combining flavor logic, nutrition balance, and practical cooking techniques.",
                    "Get a visual representation of your dish in seconds — so you know exactly what you’re creating before you start.",
                    "Fine-tune everything. Swap ingredients, tweak steps, or add your own notes to personalize the recipe to your taste.",
                  ][i]
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* ================= AI STACK ================= */}
      <h1 className="text-[#56B6C6] text-center text-4xl mt-40">
        Powered By <span className="text-emerald-500">AI</span>
      </h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12 ">
        {/* LEFT */}
        <div className="relative bg-white/[0.06] border border-[#0F828C] p-8 rounded-2xl text-leftbackdrop-blur card-hover glow-border">
          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
            RECIPE ENGINE
          </span>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
            <Brain size={18} />
          </div>

          <h3 className="font-semibold text-lg mb-3 text-white">
            Extended Thinking LLM
          </h3>

          <p className="text-gray-300 text-sm mb-4">
            A high-reasoning model that constructs recipes instead of retrieving
            them.
          </p>

          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Multi-step reasoning</li>
            <li>• Dietary awareness</li>
            <li>• Flavor balancing</li>
            <li>• Structured output</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="relative bg-white/[0.06] border border-[#0F828C] p-8 rounded-2xl text-left backdrop-blur card-hover glow-border">
          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
            VISUAL ENGINE
          </span>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-4">
            <Image size={18} />
          </div>

          <h3 className="font-semibold text-lg mb-3 text-white">
            Generative Image AI
          </h3>

          <p className="text-gray-300 text-sm mb-4">
            Creates photorealistic images for every generated dish.
          </p>

          <ul className="text-sm text-gray-300 space-y-2">
            <li>• AI-rendered visuals</li>
            <li>• Ingredient-based generation</li>
            <li>• Unique per recipe</li>
            <li>• Sets cooking expectations</li>
          </ul>
        </div>
      </div>

      <h1 className=" text-[#56B6C6] text-center mt-30 mb-10 text-4xl">
        Everything You Need To{" "}
        <span className="text-emerald-500">Cook Smarter</span>
      </h1>

      {/* ================= FEATURES (FIXED PILLS) ================= */}

      <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
        {featureData.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm 
bg-white/[0.08] border border-white/15 text-gray-200
transition-all duration-300 cursor-pointer
hover:border-[#0F828C]/60 hover:bg-[#0F828C]/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(15,130,140,0.3)]"
          >
            <span>{f.icon}</span>
            {f.text}
          </div>
        ))}
      </div>

      {/* ================= CTA ================= */}
      <section className="py-24 px-6 flex justify-center">
        <div
          className="max-w-3xl w-full 
bg-gradient-to-r from-[#ff7a2f20] to-[#9333ea20]
border border-white/10 rounded-3xl p-12 text-center backdrop-blur
relative overflow-hidden"
        >
          <h2 className="text-3xl font-semibold mb-4 text-white">
            Ready to Cook Smarter?
          </h2>

          <p className="text-gray-400 mb-8">
            Describe what you're craving and let our AI handle everything.
          </p>

          <button
            className="bg-[#0F828C] px-6 py-3 rounded-xl font-medium 
shadow-[0_0_20px_rgba(15,120,130,0.4)]
hover:scale-105 hover:shadow-[0_0_40px_rgba(15, 120, 130,0.6)]
transition"
          >
            Start Generating
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="w-9 h-9 bg-white rounded-md" />
                SmartChef<span className="text-[#FF7A2F]">AI</span>
              </div>

              <p className="mt-4 text-sm text-gray-400 max-w-xs">
                Advanced Recipe AI Generator and intelligent cooking companion.
              </p>
            </div>

            <div>
              <h3 className="text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Recipe Generator</li>
                <li>Personal Vault</li>
                <li>Explore Feed</li>
                <li>Grocery List</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Support Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-4">Connect</h3>
              <div className="flex gap-4">
                <Icon>
                  <Instagram size={18} />
                </Icon>
                <Icon>
                  <Twitter size={18} />
                </Icon>
                <Icon>
                  <Facebook size={18} />
                </Icon>
                <Icon>
                  <Github size={18} />
                </Icon>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
            <p>© 2026 SmartChef AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* NAV ITEM */
function NavItem({ icon, text, active, onClick, to }) {
  return (
    <Link to={to}>
      <div
        onClick={onClick}
        className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm cursor-pointer transition
      ${
        active
          ? "bg-[#0F828C]/25 bg- text-white shadow-md"
          : "text-gray-400 hover:text-white"
      }`}
      >
        {icon}
        {text}
      </div>
    </Link>
  );
}

/* ICON */
function Icon({ children }) {
  return (
    <div
      className="w-9 h-9 flex items-center justify-center rounded-lg 
      bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
    >
      {children}
    </div>
  );
}
