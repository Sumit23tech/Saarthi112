"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Loader2, LogOut, ChevronDown, ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "I am a 30-year-old male farmer from Rajasthan with 2 acres of land",
  "I am a 22-year-old female student from Bihar looking for scholarships",
  "I am a 45-year-old woman from UP below poverty line",
  "I am a small business owner from Maharashtra looking for loans",
];

function parseAIContent(content) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s,)]+/);
  if (match) return match[0];
  // bare domain like pmkisan.gov.in
  const bare = text.match(/\b([a-zA-Z0-9-]+\.gov\.in[^\s,)]*)/)
  if (bare) return "https://" + bare[0];
  return null;
}

function SchemeCard({ scheme }) {
  const url = extractUrl(scheme.how_to_apply);
  return (
    <div className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight">{scheme.name}</h3>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-primary hover:text-primary/80"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {scheme.ministry && (
        <p className="text-xs text-muted-foreground mb-2">{scheme.ministry}</p>
      )}
      <p className="text-xs mb-1"><span className="font-medium">Benefit:</span> {scheme.benefit}</p>
      <p className="text-xs mb-2"><span className="font-medium">Eligibility:</span> {scheme.eligibility}</p>
      <p className="text-xs text-muted-foreground mb-3">
        <span className="font-medium">Apply:</span> {scheme.how_to_apply}
      </p>
      {scheme.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {scheme.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AIMessage({ content, onFollowUp }) {
  const parsed = parseAIContent(content);

  if (!parsed) {
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  if (parsed.off_topic) {
    return (
      <p className="text-sm leading-relaxed">{parsed.message}</p>
    );
  }

  return (
    <div className="space-y-4">
      {parsed.summary && (
        <p className="text-sm leading-relaxed">{parsed.summary}</p>
      )}
      {parsed.schemes?.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {parsed.schemes.map((scheme, i) => (
            <SchemeCard key={i} scheme={scheme} />
          ))}
        </div>
      )}
      {parsed.follow_ups?.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-muted-foreground mb-2 font-medium">You might also want to ask:</p>
          <div className="flex flex-wrap gap-2">
            {parsed.follow_ups.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/chat",
  });

  const router = useRouter();
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleFollowUp = (question) => {
    setInput(question);
  };

  const getAvatar = () => user?.user_metadata?.avatar_url ?? null;

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getInitials = () => getDisplayName().slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3 bg-card shadow-sm">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shrink-0">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-base leading-tight">Sarathi</h1>
          <p className="text-xs text-muted-foreground">AI Government Scheme Finder</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </span>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((s) => !s)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                {getAvatar() ? (
                  <img src={getAvatar()} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {getInitials()}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                  {getDisplayName()}
                </span>
                <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Welcome{user ? `, ${getDisplayName()}` : ""} 👋
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Tell me about yourself and I&apos;ll find government schemes you&apos;re eligible for.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex items-start gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shrink-0 overflow-hidden",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {m.role === "user" ? (
                getAvatar() ? (
                  <img src={getAvatar()} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )
              ) : (
                <Bot size={16} />
              )}
            </div>
            <div
              className={cn(
                "max-w-[85%]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
                  : "w-full"
              )}
            >
              {m.role === "user" ? (
                <p className="text-sm leading-relaxed">{m.content}</p>
              ) : (
                <AIMessage content={m.content} onFollowUp={handleFollowUp} />
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0">
              <Bot size={16} />
            </div>
            <Card className="shadow-none">
              <CardContent className="px-4 py-2.5">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <p className="text-center text-xs text-red-500 p-2">
            Error: {error?.message || String(error)}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe yourself to find eligible schemes..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send size={16} />
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Sarathi can make mistakes. Verify scheme details on official government portals.
        </p>
      </div>
    </div>
  );
}
