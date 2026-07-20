"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Bot, User, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(({ chats }) => { setChats(chats || []); setLoading(false); });
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase text-white" style={{ fontFamily: "var(--font-oswald)" }}>
          Chat <span style={{ color: "#FF5A00" }}>History</span>
        </h1>
        <p className="text-zinc-400 mt-1">All your previous conversations with Sarathi.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-zinc-400 py-12 justify-center">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading history...</span>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <MessageSquare size={40} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-400 font-medium">No chats yet</p>
          <p className="text-zinc-600 text-sm mt-1 mb-6">Start a conversation with Sarathi</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-black text-sm"
            style={{ backgroundColor: "#FF5A00" }}
          >
            Start Chatting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat, i) => (
            <div key={chat.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-start gap-3 p-4 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{chat.user_message}</p>
                  <p className="text-zinc-600 text-xs mt-1">{formatDate(chat.created_at)}</p>
                </div>
                {expanded === i
                  ? <ChevronUp size={16} className="text-zinc-500 shrink-0 mt-1" />
                  : <ChevronDown size={16} className="text-zinc-500 shrink-0 mt-1" />
                }
              </button>

              {expanded === i && (
                <div className="px-4 pb-4 border-t border-zinc-800">
                  <div className="flex gap-3 pt-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FF5A0020" }}>
                      <Bot size={14} color="#FF5A00" />
                    </div>
                    <div className="flex-1 bg-zinc-900 rounded-xl p-3">
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{chat.ai_response}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
