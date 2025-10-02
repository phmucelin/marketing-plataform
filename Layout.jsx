import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Lightbulb,
  Heart,
  Kanban,
  Sparkles
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    emoji: "🏠"
  },
  {
    title: "Pessoal",
    url: createPageUrl("Personal"),
    icon: Heart,
    emoji: "💖"
  },
  {
    title: "Calendário de Posts",
    url: createPageUrl("PostCalendar"),
    icon: Calendar,
    emoji: "📅"
  },
  {
    title: "Kanban",
    url: createPageUrl("Kanban"),
    icon: Kanban,
    emoji: "📋"
  },
  {
    title: "Banco de Ideias",
    url: createPageUrl("Ideas"),
    icon: Lightbulb,
    emoji: "💡"
  },
  {
    title: "Clientes",
    url: createPageUrl("Clients"),
    icon: Users,
    emoji: "👥"
  },
];

export default function Layout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        <style>{`
          :root {
            --primary: #2563eb;
            --primary-light: #3b82f6;
            --primary-dark: #1d4ed8;
            --accent: #dbeafe;
            --text: #1e293b;
            --text-light: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
          }
        `}</style>
        
        <Sidebar className="border-r-2 border-blue-200 bg-white shadow-xl">
          <SidebarHeader className="border-b-2 border-blue-200 p-6 bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base leading-tight">Mariana Dias</h2>
                <p className="text-xs text-blue-100 font-medium">Social Media ✨</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url || 
                                    (item.url !== '/' && location.pathname.startsWith(item.url));
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-300 ease-in-out rounded-xl mb-2 transform hover:scale-[1.02] hover:translate-x-1 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50' 
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <span className={`text-xl transition-all duration-300 ${isActive ? 'drop-shadow-lg' : 'hover:scale-110'}`}>
                              {item.emoji}
                            </span>
                            <span className={`font-medium text-base transition-all duration-300 ${isActive ? 'font-semibold tracking-wide' : ''}`}>
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b-2 border-blue-200 px-6 py-4 md:hidden shadow-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mariana Dias</h1>
                <p className="text-xs text-blue-600">Social Media ✨</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}