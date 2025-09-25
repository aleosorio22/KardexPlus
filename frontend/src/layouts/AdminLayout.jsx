import { Outlet } from "react-router-dom";
import Sidebar, { SidebarProvider, useSidebar } from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Componente para el contenido principal que se ajusta al sidebar
function MainContent() {
  const { isExpanded } = useSidebar();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ease-in-out bg-gray-50
                 ${isExpanded ? "md:ml-64" : "md:ml-[80px]"}`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page content */}
      <main className="p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  
  return (
    <SidebarProvider>
      <Sidebar />
      <MainContent />
    </SidebarProvider>
  );
}
