"use client";

import { useEffect, useState } from "react";
import { Bookmark, Trash2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved")
      .then(r => r.json())
      .then(({ schemes }) => { setSchemes(schemes || []); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    await fetch("/api/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSchemes(s => s.filter(sc => sc.id !== id));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase text-white" style={{ fontFamily: "var(--font-oswald)" }}>
          Saved <span style={{ color: "#FF5A00" }}>Schemes</span>
        </h1>
        <p className="text-zinc-400 mt-1">Government schemes you bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-zinc-400 py-12 justify-center">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading saved schemes...</span>
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <Bookmark size={40} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">No saved schemes yet</p>
          <p className="text-zinc-600 text-sm mt-1 mb-6">Go to your dashboard and find schemes to save</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-black text-sm"
            style={{ backgroundColor: "#FF5A00" }}
          >
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FF5A0015" }}>
                    <Bookmark size={16} color="#FF5A00" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">{scheme.scheme_name}</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{scheme.scheme_details}</p>
                    <p className="text-zinc-600 text-xs mt-2">Saved on {formatDate(scheme.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(scheme.id)}
                  className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors shrink-0"
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {schemes.length > 0 && (
        <div className="text-center pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "#FF5A00" }}
          >
            Ask Sarathi about any scheme <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
