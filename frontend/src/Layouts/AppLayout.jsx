import { Outlet } from "react-router-dom";
import { Navbar, MobileNavbar } from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="">
      <Navbar />
      <main className="bg-[#0b0b0c]  pt-16 pb-20">
        {children ? children : <Outlet />}
      </main>
      <MobileNavbar />
    </div>
  );
}
