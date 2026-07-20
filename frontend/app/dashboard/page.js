"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles, ArrowRight, User, Bookmark } from "lucide-react";
import Link from "next/link";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"];
const OCCUPATIONS = ["Farmer", "Student", "Government Employee", "Private Employee", "Self Employed / Business", "Daily Wage Worker", "Unemployed", "Homemaker", "Senior Citizen", "Other"];
const INCOMES = ["Below ₹1 Lakh", "₹1-3 Lakh", "₹3-6 Lakh", "₹6-10 Lakh", "Above ₹10 Lakh"];
const GENDERS = ["Male", "Female", "Other"];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: "", age: "", gender: "", state: "", occupation: "", income: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [stats, setStats] = useState({ chats: 0, saved: 0 });
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      if (user.user_metadata?.full_name) {
        setProfile(p => ({ ...p, full_name: user.user_metadata.full_name }));
      }
    });
    fetch("/api/profile").then(r => r.json()).then(({ profile }) => {
      if (profile) setProfile(profile);
    });
    fetch("/api/history").then(r => r.json()).then(({ chats }) => {
      setStats(s => ({ ...s, chats: chats?.length || 0 }));
    });
    fetch("/api/saved").then(r => r.json()).then(({ schemes }) => {
      setStats(s => ({ ...s, saved: schemes?.length || 0 }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFindSchemes = async () => {
    if (!profile.age || !profile.state || !profile.occupation) return;
    setLoadingSchemes(true);
    setSchemes([]);
    const prompt = `I am a ${profile.age} year old ${profile.gender || "person"}, ${profile.occupation} from ${profile.state} with income ${profile.income || "unknown"}. List exactly 6 government schemes I qualify for. For each scheme respond in this exact format:
SCHEME: [name]
BENEFIT: [one line benefit]
APPLY: [official portal URL or ministry name]
---`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });

    const text = await res.text();
    const cleaned = text.replace(/^[0-9a-f]:"?|"$/gm, "").replace(/\\n/g, "\n").replace(/^[ded]:\{.*$/gm, "").trim();
    const blocks = cleaned.split("---").filter(b => b.trim());
    const parsed = blocks.map(block => {
      const name = block.match(/SCHEME:\s*(.+)/)?.[1]?.trim() || "";
      const benefit = block.match(/BENEFIT:\s*(.+)/)?.[1]?.trim() || "";
      const apply = block.match(/APPLY:\s*(.+)/)?.[1]?.trim() || "";
      return { name, benefit, apply };
    }).filter(s => s.name);

    setSchemes(parsed);
    setLoadingSchemes(false);
  };

  const handleSaveScheme = async (scheme) => {
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheme_name: scheme.name, scheme_details: `${scheme.benefit} | Apply: ${scheme.apply}` }),
    });
    setStats(s => ({ ...s, saved: s.saved + 1 }));
  };

  const getDisplayName = () => {
    if (profile.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "there";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold uppercase text-white" style={{ fontFamily: "var(--font-oswald)" }}>
          Welcome, <span style={{ color: "#FF5A00" }}>{getDisplayName()}</span>
        </h1>
        <p className="text-zinc-400 mt-1">Complete your profile to get personalized scheme recommendations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Chats", value: stats.chats },
          { label: "Saved Schemes", value: stats.saved },
          { label: "Profile", value: profile.state ? "Complete ✓" : "Incomplete" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-oswald)", color: "#FF5A00" }}>{s.value}</p>
            <p className="text-zinc-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FF5A0020" }}>
            <User size={18} color="#FF5A00" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg" style={{ fontFamily: "var(--font-oswald)" }}>YOUR PROFILE</h2>
            <p className="text-zinc-500 text-xs">Used to find schemes automatically</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "full_name", label: "Full Name", type: "text", placeholder: "Your full name" },
            { key: "age", label: "Age", type: "number", placeholder: "Your age" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={profile[key] || ""}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FF5A00] transition-colors"
              />
            </div>
          ))}

          {[
            { key: "gender", label: "Gender", options: GENDERS },
            { key: "state", label: "State", options: STATES },
            { key: "occupation", label: "Occupation", options: OCCUPATIONS },
            { key: "income", label: "Annual Income", options: INCOMES },
          ].map(({ key, label, options }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">{label}</label>
              <select
                value={profile[key] || ""}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5A00] transition-colors"
              >
                <option value="">Select {label}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-black text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#FF5A00" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saved ? "Saved!" : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={handleFindSchemes}
              disabled={loadingSchemes || !profile.age || !profile.state}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white text-sm border border-zinc-700 hover:border-[#FF5A00] transition-colors disabled:opacity-50"
            >
              {loadingSchemes ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} color="#FF5A00" />}
              Find My Schemes
            </button>
          </div>
        </form>
      </div>

      {/* Scheme Results */}
      {(loadingSchemes || schemes.length > 0) && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={20} color="#FF5A00" />
            <h2 className="font-bold text-white text-lg" style={{ fontFamily: "var(--font-oswald)" }}>
              YOUR ELIGIBLE SCHEMES
            </h2>
          </div>

          {loadingSchemes ? (
            <div className="flex items-center gap-3 text-zinc-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Finding schemes for your profile...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemes.map((scheme, i) => (
                <div key={i} className="border border-zinc-800 rounded-xl p-4 hover:border-[#FF5A00] transition-colors group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm leading-tight">{scheme.name}</h3>
                    <button
                      onClick={() => handleSaveScheme(scheme)}
                      className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-[#FF5A00] hover:bg-zinc-800 transition-colors"
                      title="Save scheme"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3">{scheme.benefit}</p>
                  <p className="text-xs text-zinc-600">
                    <span className="text-[#FF5A00]">Apply:</span> {scheme.apply}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-zinc-500 text-sm">Want more details on any scheme?</p>
            <Link
              href="/chat"
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#FF5A00" }}
            >
              Ask Sarathi <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
