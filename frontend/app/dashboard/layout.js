"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LayoutDashboard, MessageSquare, Bookmark, LogOut, Bot, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/history", icon: MessageSquare, label: "Chat History" },
  { href: "/dashboard/saved", icon: Bookmark, label: "Saved Schemes" },
];

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getAvatar = () => user?.user_metadata?.avatar_url || null;
  const getInitials = () => getDisplayName().slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white flex" style={{ fontFamily: "var(--font-inter)" }}>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold uppercase tracking-widest text-white"
            style={{ fontFamily: "var(--font-oswald)" }}>
            SARATHI
          </Link>
          <button className="md:hidden text-zinc-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
              style={pathname === href ? { backgroundColor: "#FF5A00" } : {}}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-zinc-800 mt-3">
            <Link
              href="/chat"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Bot size={18} />
              Open Chat
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            {getAvatar() ? (
              <img src={getAvatar()} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
                style={{ backgroundColor: "#FF5A00" }}>
                {getInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{getDisplayName()}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-zinc-900 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <span className="font-bold uppercase tracking-widest text-white text-lg"
            style={{ fontFamily: "var(--font-oswald)" }}>
            SARATHI
          </span>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
