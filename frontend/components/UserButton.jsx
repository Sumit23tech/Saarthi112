"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LogOut, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UserButton() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getAvatar = () => user?.user_metadata?.avatar_url || null;
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };
  const getInitials = () => getDisplayName().slice(0, 2).toUpperCase();

  // Not logged in — show Login button
  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-black transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#FF5A00" }}
      >
        Get Started <ArrowRight size={14} />
      </Link>
    );
  }

  // Logged in — show avatar + dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((s) => !s)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-zinc-700 hover:border-[#FF5A00] transition-colors"
      >
        {getAvatar() ? (
          <img src={getAvatar()} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
            style={{ backgroundColor: "#FF5A00" }}>
            {getInitials()}
          </div>
        )}
        <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-white truncate">{getDisplayName()}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setShowDropdown(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            <ArrowRight size={14} color="#FF5A00" />
            Dashboard
          </Link>
          <Link
            href="/chat"
            onClick={() => setShowDropdown(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            <ArrowRight size={14} color="#FF5A00" />
            Open Chat
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-zinc-900 transition-colors border-t border-zinc-800"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
