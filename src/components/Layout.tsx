import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto mt-20 px-4 pb-28 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
