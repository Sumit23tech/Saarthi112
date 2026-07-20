"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UserButton from "@/components/UserButton";
import {
  ArrowRight, Volume2, VolumeX, Tractor, GraduationCap,
  HeartPulse, Briefcase, Home, Users, ChevronRight, Star, Menu, X
} from "lucide-react";

/* ── DATA ───────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    icon: Tractor, label: "Farmer", color: "#FF5A00",
    schemes: ["PM-KISAN ₹6000/yr", "Kisan Credit Card", "Fasal Bima Yojana"],
  },
  {
    icon: GraduationCap, label: "Student", color: "#FF5A00",
    schemes: ["NSP Scholarships", "PM Vidyalakshmi Loan", "Skill India Program"],
  },
  {
    icon: HeartPulse, label: "Health", color: "#FF5A00",
    schemes: ["Ayushman Bharat ₹5L", "Janani Suraksha", "PM Jan Arogya"],
  },
  {
    icon: Users, label: "Women", color: "#FF5A00",
    schemes: ["Beti Bachao Scheme", "Mahila Shakti Kendra", "Ujjwala Yojana"],
  },
  {
    icon: Briefcase, label: "Business", color: "#FF5A00",
    schemes: ["Mudra Loan ₹10L", "Startup India Seed", "MSME Credit Scheme"],
  },
  {
    icon: Home, label: "Housing", color: "#FF5A00",
    schemes: ["PM Awas Yojana", "CLSS Home Loan", "Gramin Awas Scheme"],
  },
];

const STORIES = [
  {
    name: "Rahul Verma", state: "Bihar", age: 24,
    result: "Got ₹1.2L Mudra loan for his tea stall in 3 weeks.",
    rating: 5,
  },
  {
    name: "Sunita Devi", state: "Rajasthan", age: 38,
    result: "Enrolled in Ayushman Bharat. Family of 5 now covered.",
    rating: 5,
  },
  {
    name: "Arjun Patil", state: "Maharashtra", age: 19,
    result: "Received NSP scholarship ₹36,000 for engineering.",
    rating: 5,
  },
  {
    name: "Meena Kumari", state: "UP", age: 45,
    result: "Got free LPG connection under Ujjwala Yojana.",
    rating: 5,
  },
  {
    name: "Deepak Singh", state: "Punjab", age: 52,
    result: "PM-KISAN ₹6000 now credited directly to his account.",
    rating: 5,
  },
];

const STATS = [
  { value: "500+", label: "Schemes Covered" },
  { value: "28", label: "States & UTs" },
  { value: "10L+", label: "Citizens Helped" },
  { value: "3 Min", label: "Avg. Time to Find" },
];

/* ── HELPERS ────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── FLIP CARD ──────────────────────────────────────────────── */
function CategoryCard({ item, delay }) {
  const Icon = item.icon;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flip-card h-52 cursor-pointer"
    >
      <div className="flip-card-inner rounded-2xl">
        {/* Front */}
        <div className="flip-card-front rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FF5A0020" }}>
            <Icon size={32} color="#FF5A00" />
          </div>
          <span className="font-oswald text-xl uppercase tracking-widest text-white">{item.label}</span>
          <span className="text-xs text-zinc-500">Hover to explore →</span>
        </div>
        {/* Back */}
        <div className="flip-card-back rounded-2xl bg-zinc-900 border border-[#FF5A00] flex flex-col justify-center px-6 gap-3">
          <p className="text-xs uppercase tracking-widest text-[#FF5A00] font-semibold mb-1">Top Schemes</p>
          {item.schemes.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-zinc-300">
              <ChevronRight size={14} color="#FF5A00" className="shrink-0" />
              {s}
            </div>
          ))}
          <Link
            href="/chat"
            className="mt-3 w-full py-2 rounded-lg text-center text-sm font-semibold text-black"
            style={{ backgroundColor: "#FF5A00" }}
          >
            Find My Scheme
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── STORY CARD ─────────────────────────────────────────────── */
function StoryCard({ story }) {
  return (
    <div className="min-w-[300px] max-w-[300px] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 select-none">
      <div className="flex gap-1">
        {Array.from({ length: story.rating }).map((_, i) => (
          <Star key={i} size={14} fill="#FF5A00" color="#FF5A00" />
        ))}
      </div>
      <p className="text-zinc-200 text-base leading-relaxed">&ldquo;{story.result}&rdquo;</p>
      <div className="mt-auto">
        <p className="text-white font-semibold">{story.name}</p>
        <p className="text-zinc-500 text-sm">{story.age} yrs · {story.state}</p>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────────── */
export default function LandingPage() {
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const carouselRef = useRef(null);

  // Sticky CTA: show after scrolling past hero
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Drag carousel
  const [dragX, setDragX] = useState(0);

  const toggleMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  return (
    <div className="grain bg-black text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "var(--font-inter)" }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <span className="text-2xl font-bold uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-oswald)" }}>
          SARATHI
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#categories" className="hover:text-white transition-colors">Schemes</a>
          <a href="#stories" className="hover:text-white transition-colors">Stories</a>
          <a href="#stats" className="hover:text-white transition-colors">Impact</a>
        </div>
        <UserButton />
        <button className="md:hidden text-white" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 flex flex-col gap-4 px-6 py-6"
          >
            {["#categories", "#stories", "#stats"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-zinc-300 text-lg">
                {["Schemes", "Stories", "Impact"][i]}
              </a>
            ))}
            <Link href="/chat" onClick={() => setMenuOpen(false)}
              className="mt-2 py-3 rounded-full text-center font-semibold text-black"
              style={{ backgroundColor: "#FF5A00" }}>
              Try Sarathi Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video BG */}
        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-24 right-6 z-10 p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[#FF5A00] text-sm uppercase tracking-[0.3em] font-semibold mb-6"
          >
            AI-Powered · Free · For Every Indian
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-none tracking-tight mb-6"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Don&apos;t Just Exist.
            <br />
            <span style={{ color: "#FF5A00" }}>Get What You</span>
            <br />
            Earned.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Find government schemes you qualify for, instantly. Just tell Sarathi about yourself.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/chat"
              className="flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#FF5A00", fontFamily: "var(--font-oswald)" }}
            >
              Find My Scheme <ArrowRight size={20} />
            </Link>

          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-zinc-600 text-sm"
          >
            No registration · No fees · Works in Hindi & English
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-zinc-600" />
          <span className="text-xs uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-16 border-y border-zinc-900 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1} className="text-center">
              <p className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-oswald)", color: "#FF5A00" }}>
                {s.value}
              </p>
              <p className="text-zinc-500 text-sm mt-1 uppercase tracking-wider">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-[#FF5A00] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Who Is It For?</p>
          <h2 className="text-4xl md:text-6xl font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
            Your Category.
            <br />
            <span className="text-zinc-500">Your Schemes.</span>
          </h2>
          <p className="text-zinc-500 mt-4 text-base max-w-md mx-auto">
            Hover a card to see what&apos;s inside. Tap on mobile.
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((item, i) => (
            <CategoryCard key={item.label} item={item} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <p className="text-[#FF5A00] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Simple as 1-2-3</p>
            <h2 className="text-4xl md:text-6xl font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
              How It Works
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Tell Us About You", desc: "Type or speak your age, job, state, and income. No forms. Just talk." },
              { step: "02", title: "AI Finds Schemes", desc: "Sarathi scans 500+ schemes and matches them to your exact profile." },
              { step: "03", title: "Apply Instantly", desc: "Get direct links to official portals with step-by-step guidance." },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.15}>
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 h-full">
                  <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-oswald)", color: "#FF5A0030" }}>
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>{item.title}</h3>
                  <p className="text-zinc-400 text-base leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORIES CAROUSEL ── */}
      <section id="stories" className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="mb-12">
            <p className="text-[#FF5A00] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Real People. Real Results.</p>
            <div className="flex items-end justify-between">
              <h2 className="text-4xl md:text-6xl font-bold uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                Success
                <br />
                <span className="text-zinc-500">Stories</span>
              </h2>
              <p className="text-zinc-600 text-sm hidden md:block">← Drag to explore →</p>
            </div>
          </FadeUp>
        </div>

        <motion.div
          ref={carouselRef}
          drag="x"
          dragConstraints={{ right: 0, left: -(STORIES.length * 320 - (typeof window !== "undefined" ? window.innerWidth : 800) + 48) }}
          dragElastic={0.1}
          className="flex gap-4 px-6 cursor-grab active:cursor-grabbing"
          style={{ width: "max-content" }}
        >
          {STORIES.map((story) => (
            <StoryCard key={story.name} story={story} />
          ))}
        </motion.div>

        <p className="text-center text-zinc-700 text-sm mt-6 md:hidden">← Swipe to see more →</p>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 text-center bg-zinc-950 border-t border-zinc-900">
        <FadeUp>
          <h2 className="text-5xl md:text-7xl font-bold uppercase mb-6" style={{ fontFamily: "var(--font-oswald)" }}>
            Your Benefits
            <br />
            <span style={{ color: "#FF5A00" }}>Are Waiting.</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
            Thousands of crores in government benefits go unclaimed every year. Don&apos;t be one of them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#FF5A00", fontFamily: "var(--font-oswald)" }}
            >
              Start For Free <ArrowRight size={22} />
            </Link>

          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-sm">
        <span className="font-bold uppercase tracking-widest text-zinc-400" style={{ fontFamily: "var(--font-oswald)" }}>
          SARATHI
        </span>
        <p>Built for NASSCOM Internship Competition · 2025</p>
        <p>Made with ❤️ for every Indian citizen</p>
      </footer>

      {/* ── STICKY BOTTOM CTA ── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 flex items-center justify-between gap-4"
          >
            <p className="text-sm text-zinc-400 hidden sm:block">
              Find schemes you qualify for — <span className="text-white font-semibold">free, instant, AI-powered.</span>
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                href="/chat"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-black text-sm transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#FF5A00", fontFamily: "var(--font-oswald)" }}
              >
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Try Sarathi Now
                </motion.span>
                <ArrowRight size={16} />
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
