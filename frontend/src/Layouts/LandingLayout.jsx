import { Outlet } from "react-router-dom";
import {
  LandingNavbar,
  LandingMobileNavbar,
} from "../components/LandingNavbar";

export default function LandingLayout({ children }) {
  return (
    <div className="">
      <LandingNavbar />
      <main className="bg-[#050816] pt-16 pb-20">
        {children ? children : <Outlet />}
      </main>
      <LandingMobileNavbar />
    </div>
  );
}
