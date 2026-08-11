"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  Copy,
  FileText,
  Grid2X2,
  Layers3,
  List,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import GlowOrbs from "@/components/GlowOrbs";
import LiquidButton from "@/components/LiquidButton";
import {
  addOwnedId,
  createId,
  deleteNote,
  getAllOwnedNotes,
  saveNote,
  type Note,
} from "@/lib/storage";

type SortMode = "updated" | "created" | "title";
type ViewMode = "grid" | "list";

const glass =
  "border border-white/[0.075] bg-white/[0.028] backdrop-blur-2xl";
const softGlass =
  "border border-white/[0.055] bg-white/[0.018] backdrop-blur-xl";

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeDate(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(timestamp);
}

function summarize(note: Note | null) {
  if (!note?.content.trim()) {
    return "Your note is empty. Start writing and Champion Assistant will turn important ideas into a cleaner summary.";
  }

  const clean = note.content.replace(/\s+/g, " ").trim();
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return sentences.length ? sentences.join(" ") : clean.slice(0, 420);
}

export default function HomePage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  const [aiOpen, setAiOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(getAllOwnedNotes());
    setMounted(true);
  }, []);

  const latestNote = useMemo(
    () =>
      notes.length
        ? [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        : null,
    [notes]
  );

  const totalWords = useMemo(
    () => notes.reduce((sum, note) => sum + wordCount(note.content), 0),
    [notes]
  );

  const totalCharacters = useMemo(
    () => notes.reduce((sum, note) => sum + note.content.length, 0),
    [notes]
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...notes]
      .filter(
        (note) =>
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (sort === "title") {
          return (a.title || "Untitled Note").localeCompare(
            b.title || "Untitled Note"
          );
        }
        return sort === "created"
          ? b.createdAt - a.createdAt
          : b.updatedAt - a.updatedAt;
      });
  }, [notes, search, sort]);

  function refreshNotes() {
    setNotes(getAllOwnedNotes());
  }

  function createNote() {
    const id = createId();
    const now = Date.now();

    saveNote({
      id,
      title: "Untitled Note",
      content: "",
      createdAt: now,
      updatedAt: now,
    });

    addOwnedId(id);
    router.push(`/note/${id}`);
  }

  function openAI(note?: Note) {
    setSelectedNote(note || latestNote || notes[0] || null);
    setAiOpen(true);
  }

  function askDelete(note: Note, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDeleteTarget(note);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteNote(deleteTarget.id);
    setDeleteTarget(null);
    refreshNotes();
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summarize(selectedNote));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        createNote();
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
        setAiOpen(false);
        setDeleteTarget(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-cyan-400/25">
      <GlowOrbs />

      {/* Cinematic background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 70, -30, 0],
            y: [0, -35, 40, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-44 -top-40 h-[620px] w-[620px] rounded-full bg-violet-600/[0.11] blur-[180px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.94, 1.08, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-48 top-[18%] h-[680px] w-[680px] rounded-full bg-cyan-500/[0.065] blur-[200px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,.12),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.016)_1px,transparent_1px)] bg-[size:68px_68px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* NAVIGATION */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 flex h-[76px] items-center justify-between border-b border-white/[0.055] bg-[#02040a]/72 backdrop-blur-2xl"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[15px] border border-white/10 bg-white/[0.045] shadow-[0_0_45px_rgba(124,58,237,.14)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-60%] bg-[conic-gradient(from_0deg,transparent,rgba(168,85,247,.95),transparent,rgba(34,211,238,.85),transparent)]"
              />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#070b14]">
                <BrainCircuit size={18} className="text-cyan-100" />
              </div>
            </motion.div>

            <div className="text-left">
              <div className="text-[15px] font-black tracking-tight">
                Champion<span className="text-cyan-300">.</span>
              </div>
              <div className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                Intelligent Notes
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.035] px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-200/55">
                Local & Private
              </span>
            </div>

            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[9px] text-white/35 transition hover:border-white/15 hover:text-white/70"
            >
              <Command size={11} />
              Command
              <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[8px]">
                K
              </kbd>
            </button>
          </div>

          <button
            onClick={() => openAI()}
            className="flex items-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.055] px-3.5 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.09]"
          >
            <WandSparkles size={14} />
            <span className="hidden sm:inline">AI Studio</span>
          </button>
        </motion.header>

        {/* HERO */}
        <section className="relative flex min-h-[690px] flex-col items-center justify-center py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75 }}
            className="rounded-full border border-cyan-300/10 bg-cyan-300/[0.035] px-4 py-2 shadow-[0_0_50px_rgba(34,211,238,.05)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-cyan-200" />
              <span className="text-[10px] font-semibold tracking-wide text-cyan-50/65">
                A calmer place for your ideas
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[9px] text-white/25">No login</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08 }}
            className="mt-8 max-w-6xl text-5xl font-black leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-[105px]"
          >
            Write freely.
            <br />
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              Think clearly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="mt-8 max-w-2xl text-sm leading-7 text-white/35 sm:text-lg"
          >
            One beautiful workspace for notes, numbers, ideas and AI-powered
            clarity — without accounts, clutter or distractions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <LiquidButton
              onClick={createNote}
              className="px-8 py-4 text-sm sm:px-10"
            >
              <Plus size={18} />
              Create New Note
              <ArrowRight size={16} />
            </LiquidButton>

            <button
              onClick={() => openAI()}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.075] bg-white/[0.025] px-6 py-4 text-sm font-medium text-white/55 backdrop-blur-xl transition hover:border-cyan-300/15 hover:bg-white/[0.045] hover:text-white"
            >
              <WandSparkles size={17} className="text-cyan-200/70" />
              Explore AI Studio
            </button>
          </motion.div>

          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {[
              [Zap, "Smart totals"],
              [WandSparkles, "AI summaries"],
              [Search, "Instant search"],
              [ShieldCheck, "Private by design"],
            ].map(([Icon, label]) => {
              const FeatureIcon = Icon as typeof Zap;
              return (
                <span
                  key={label as string}
                  className="flex items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.018] px-3 py-1.5 text-[9px] text-white/25"
                >
                  <FeatureIcon size={11} className="text-cyan-200/60" />
                  {label as string}
                </span>
              );
            })}
          </div>

          {/* Floating preview */}
          <motion.div
            initial={{ opacity: 0, y: 55, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="absolute -bottom-16 hidden w-[880px] lg:block"
          >
            <div className="rounded-[2.3rem] border border-white/[0.09] bg-white/[0.028] p-1 shadow-[0_45px_130px_rgba(0,0,0,.65)] backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[2rem] border border-white/[0.05] bg-[#070b13]/95 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-300/55" />
                    <span className="h-2 w-2 rounded-full bg-amber-300/55" />
                    <span className="h-2 w-2 rounded-full bg-emerald-300/55" />
                  </div>
                  <div className="flex items-center gap-2 text-[8px] tracking-[0.22em] text-white/15">
                    <BrainCircuit size={10} />
                    CHAMPION WORKSPACE
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3 rounded-2xl border border-white/[0.05] bg-white/[0.022] p-4">
                    <div className="h-2 w-16 rounded-full bg-cyan-300/15" />
                    <div className="mt-5 space-y-2">
                      <div className="h-8 rounded-lg bg-cyan-300/[0.06]" />
                      <div className="h-8 rounded-lg bg-white/[0.025]" />
                      <div className="h-8 rounded-lg bg-white/[0.025]" />
                    </div>
                  </div>

                  <div className="col-span-5 rounded-2xl border border-white/[0.05] bg-white/[0.022] p-5">
                    <div className="h-2 w-28 rounded-full bg-white/[0.08]" />
                    <div className="mt-6 space-y-3">
                      <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                      <div className="h-2 w-[88%] rounded-full bg-white/[0.045]" />
                      <div className="h-2 w-[71%] rounded-full bg-white/[0.035]" />
                      <div className="mt-6 h-20 rounded-xl bg-gradient-to-br from-violet-400/[0.08] to-cyan-400/[0.04]" />
                    </div>
                  </div>

                  <div className="col-span-4 rounded-2xl border border-cyan-300/10 bg-gradient-to-br from-cyan-300/[0.055] to-violet-400/[0.055] p-5">
                    <div className="flex items-center gap-2">
                      <WandSparkles size={13} className="text-cyan-200/80" />
                      <span className="text-[8px] font-bold tracking-[0.18em] text-cyan-100/45">
                        AI INSIGHT
                      </span>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-full rounded-full bg-cyan-200/10" />
                      <div className="h-2 w-[86%] rounded-full bg-cyan-200/[0.07]" />
                      <div className="h-2 w-[65%] rounded-full bg-cyan-200/[0.045]" />
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="h-7 w-20 rounded-lg bg-cyan-300/[0.07]" />
                      <div className="h-7 w-16 rounded-lg bg-violet-300/[0.07]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* WORKSPACE */}
        <section className="relative mt-28 pb-12 lg:mt-44">
          <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-200/40">
                Workspace
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Your ideas, organized beautifully.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/25">
                Everything important stays one click away.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.022] px-4 py-3 text-[10px] text-white/35 transition hover:bg-white/[0.05] sm:flex"
              >
                <Command size={13} />
                Quick actions
              </button>
              <LiquidButton onClick={createNote} className="px-5 py-3">
                <Plus size={15} />
                New Note
              </LiquidButton>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              [Layers3, "Notes", notes.length, "In your library"],
              [FileText, "Words", totalWords.toLocaleString(), "Across all notes"],
              [Zap, "Characters", totalCharacters.toLocaleString(), "Written so far"],
              [ShieldCheck, "Privacy", "LOCAL", "No account required"],
            ].map(([Icon, label, value, hint], index) => {
              const I = Icon as typeof Layers3;
              return (
                <motion.div
                  key={label as string}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-2xl p-5 ${softGlass} transition hover:border-cyan-300/10 hover:bg-white/[0.032]`}
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/[0.025] blur-2xl transition group-hover:bg-cyan-300/[0.07]" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.045]">
                      <I size={16} className="text-cyan-100/65" />
                    </div>
                    <Sparkles size={11} className="text-white/10" />
                  </div>
                  <div className="relative mt-5 text-2xl font-black tracking-tight">
                    {value as string | number}
                  </div>
                  <div className="relative mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/20">
                    {label as string}
                  </div>
                  <div className="relative mt-2 text-[9px] text-white/15">
                    {hint as string}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mt-5 overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-gradient-to-br from-violet-500/[0.07] via-white/[0.022] to-cyan-400/[0.055] p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/[0.055] blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-500/[0.07] blur-[100px]" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.055]">
                    <WandSparkles size={18} className="text-cyan-100/80" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-100/45">
                      Champion AI Studio
                    </p>
                    <p className="mt-0.5 text-xs text-white/25">
                      Turn notes into clarity
                    </p>
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
                  Less reading.
                  <br />
                  <span className="bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
                    More understanding.
                  </span>
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/25">
                  Select a note and generate a clean local summary. The interface
                  is ready for a production AI API whenever you want to connect one.
                </p>
              </div>

              <LiquidButton onClick={() => openAI()} className="shrink-0 px-6 py-3.5">
                <WandSparkles size={16} />
                Open AI Studio
                <ArrowRight size={15} />
              </LiquidButton>
            </div>
          </motion.div>

          {/* LIBRARY HEADER */}
          <div className="mt-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/15">
                Knowledge library
              </p>
              <h3 className="mt-1 text-2xl font-black">
                {search.trim() ? "Search results" : "Recent Notes"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.018] p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`rounded-lg p-2 transition ${
                    view === "grid"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/20 hover:text-white/50"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`rounded-lg p-2 transition ${
                    view === "list"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/20 hover:text-white/50"
                  }`}
                  aria-label="List view"
                >
                  <List size={14} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="h-10 appearance-none rounded-xl border border-white/[0.07] bg-white/[0.02] pl-3 pr-9 text-[10px] text-white/35 outline-none focus:border-cyan-300/15"
                  aria-label="Sort notes"
                >
                  <option value="updated" className="bg-[#070b13]">
                    Recently updated
                  </option>
                  <option value="created" className="bg-[#070b13]">
                    Recently created
                  </option>
                  <option value="title" className="bg-[#070b13]">
                    Title A–Z
                  </option>
                </select>
                <ChevronDown
                  size={11}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/15"
                />
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative mt-5">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, ideas, keywords..."
              className="h-12 w-full rounded-2xl border border-white/[0.07] bg-white/[0.022] pl-11 pr-16 text-xs text-white outline-none transition placeholder:text-white/15 focus:border-cyan-300/15 focus:bg-white/[0.035]"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.05] bg-white/[0.03] px-2 py-1 font-mono text-[8px] text-white/15 sm:block">
              /
            </kbd>
          </div>

          {/* NOTES */}
          {filteredNotes.length > 0 && (
            <div
              className={`mt-5 ${
                view === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-3"
              }`}
            >
              {filteredNotes.map((note, index) => (
                <motion.a
                  key={note.id}
                  href={`/note/${note.id}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.035, 0.18) }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-[1.65rem] p-5 ${glass} transition duration-500 hover:border-cyan-300/12 hover:bg-white/[0.04] hover:shadow-[0_28px_85px_rgba(0,0,0,.4)] ${
                    view === "grid" ? "min-h-[245px]" : ""
                  }`}
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/0 blur-[80px] transition group-hover:bg-cyan-400/[0.07]" />
                  <div className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-all duration-1000 group-hover:left-[130%]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.045]">
                        <FileText size={16} className="text-cyan-100/65" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/15">
                          Note
                        </div>
                        <h4 className="truncate text-sm font-bold text-white/80">
                          {note.title || "Untitled Note"}
                        </h4>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openAI(note);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/15 opacity-0 transition hover:bg-cyan-300/10 hover:text-cyan-200 md:group-hover:opacity-100"
                        aria-label="Open AI summary"
                      >
                        <WandSparkles size={13} />
                      </button>
                      <button
                        onClick={(event) => askDelete(note, event)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/15 opacity-0 transition hover:bg-red-400/10 hover:text-red-300 md:group-hover:opacity-100"
                        aria-label="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <p className="line-clamp-3 text-xs leading-6 text-white/25">
                      {note.content || "Empty note — ready for your ideas."}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-white/15">
                        <Clock3 size={10} />
                        {relativeDate(note.updatedAt)}
                      </span>

                      <span className="flex items-center gap-1 text-[9px] font-semibold text-cyan-200/30 transition group-hover:text-cyan-200/70">
                        Open
                        <ChevronRight size={11} />
                      </span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <span className="rounded-full border border-white/[0.05] bg-white/[0.018] px-2.5 py-1 text-[8px] text-white/15">
                        {wordCount(note.content)} words
                      </span>
                      <span className="rounded-full border border-white/[0.05] bg-white/[0.018] px-2.5 py-1 text-[8px] text-white/15">
                        {note.content.length} chars
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {mounted && notes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative mt-5 overflow-hidden rounded-[2rem] p-12 text-center sm:p-20 ${glass}`}
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-[100px]" />
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -7, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-cyan-300/10 bg-cyan-300/[0.045]"
                >
                  <BrainCircuit size={29} className="text-cyan-100/65" />
                </motion.div>
                <h3 className="mt-7 text-2xl font-black">
                  Your workspace starts here.
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/25">
                  Create your first note and turn this empty canvas into your
                  personal knowledge system.
                </p>
                <div className="mt-8">
                  <LiquidButton onClick={createNote} className="px-7 py-3.5">
                    <Plus size={17} />
                    Create First Note
                  </LiquidButton>
                </div>
              </div>
            </motion.div>
          )}

          {mounted && notes.length > 0 && filteredNotes.length === 0 && (
            <div className={`mt-5 rounded-[2rem] p-12 text-center ${glass}`}>
              <Search size={27} className="mx-auto text-white/12" />
              <p className="mt-4 text-sm font-semibold text-white/35">
                Nothing matched “{search}”
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* FEATURE CARDS */}
          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              [WandSparkles, "AI summaries", "Turn long notes into concise, readable ideas."],
              [Zap, "Smart numbers", "Keep numeric information clear and easy to manage."],
              [ShieldCheck, "Private by design", "A clean local-first workspace without forced accounts."],
            ].map(([Icon, title, text], index) => {
              const I = Icon as typeof WandSparkles;
              return (
                <motion.div
                  key={title as string}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl p-5 ${softGlass} transition hover:border-cyan-300/10`}
                >
                  <I size={18} className="text-cyan-100/60" />
                  <h4 className="mt-5 text-sm font-bold text-white/65">
                    {title as string}
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-white/22">
                    {text as string}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-24 border-t border-white/[0.05] py-10">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                <BrainCircuit size={15} className="text-cyan-100/65" />
              </div>
              <div>
                <div className="text-xs font-bold">Champion Assistant</div>
                <div className="text-[9px] text-white/15">
                  Write freely. Think clearly.
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-[8px] uppercase tracking-[0.3em] text-white/10">
                Designed & Developed by
              </div>
              <div className="mt-1 bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-sm font-black tracking-[0.14em] text-transparent">
                ABDUL MATEEN
              </div>
            </div>
          </div>

          <div className="mt-7 text-center text-[8px] text-white/10">
            © {new Date().getFullYear()} Champion Assistant · Built for focused thinking.
          </div>
        </footer>
      </div>

      {/* AI STUDIO */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAiOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[#070b13] p-6 shadow-[0_45px_140px_rgba(0,0,0,.85)] sm:p-8"
            >
              <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-400/[0.055] blur-[100px]" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.05]">
                    <WandSparkles size={18} className="text-cyan-100/75" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-cyan-100/40">
                      Champion AI
                    </p>
                    <h2 className="mt-1 text-xl font-black">Note Intelligence</h2>
                  </div>
                </div>

                <button
                  onClick={() => setAiOpen(false)}
                  className="rounded-xl border border-white/[0.05] p-2 text-white/20 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {notes.length ? (
                <>
                  <div className="relative mt-7">
                    <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/18">
                      Select note
                    </label>
                    <div className="relative mt-2">
                      <select
                        value={selectedNote?.id || ""}
                        onChange={(e) =>
                          setSelectedNote(
                            notes.find((n) => n.id === e.target.value) || null
                          )
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 pr-10 text-xs text-white outline-none focus:border-cyan-300/15"
                      >
                        {notes.map((note) => (
                          <option
                            key={note.id}
                            value={note.id}
                            className="bg-[#070b13]"
                          >
                            {note.title || "Untitled Note"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/15"
                      />
                    </div>
                  </div>

                  <div className="relative mt-4 rounded-[1.5rem] border border-cyan-300/10 bg-gradient-to-br from-violet-400/[0.055] to-cyan-400/[0.045] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-100/45">
                        <Sparkles size={12} />
                        AI Summary
                      </div>

                      <button
                        onClick={copySummary}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-[8px] text-white/25 hover:bg-white/[0.05]"
                      >
                        {copied ? <Check size={10} /> : <Copy size={10} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-white/50">
                      {summarize(selectedNote)}
                    </p>

                    {selectedNote && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/[0.05] px-2.5 py-1 text-[8px] text-white/15">
                          {wordCount(selectedNote.content)} words
                        </span>
                        <span className="rounded-full border border-white/[0.05] px-2.5 py-1 text-[8px] text-white/15">
                          {selectedNote.content.length} chars
                        </span>
                        <span className="rounded-full border border-white/[0.05] px-2.5 py-1 text-[8px] text-white/15">
                          {formatDate(selectedNote.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.025] px-4 py-3 text-[8px] leading-5 text-amber-100/25">
                    Local summary mode is active. Connect your preferred AI API
                    when you want model-generated intelligence.
                  </div>
                </>
              ) : (
                <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.022] p-10 text-center">
                  <FileText size={25} className="mx-auto text-white/12" />
                  <p className="mt-4 text-xs text-white/25">
                    Create a note first.
                  </p>
                  <button
                    onClick={() => {
                      setAiOpen(false);
                      createNote();
                    }}
                    className="mt-5 rounded-xl bg-cyan-300/[0.08] px-4 py-2.5 text-[10px] font-semibold text-cyan-100/65"
                  >
                    <Plus size={13} className="mr-1 inline" />
                    Create Note
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMAND CENTER */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 z-[110] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#070b13]/95 p-2 shadow-[0_40px_120px_rgba(0,0,0,.85)]"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
                <Command size={15} className="text-cyan-200/45" />
                <input
                  autoFocus
                  placeholder="What do you want to do?"
                  className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/15"
                />
                <kbd className="rounded-md border border-white/[0.06] px-1.5 py-1 font-mono text-[8px] text-white/15">
                  ESC
                </kbd>
              </div>

              <div className="p-2">
                {[
                  [Plus, "Create new note", "Start writing immediately", createNote],
                  [
                    WandSparkles,
                    "Open AI Studio",
                    "Summarize a note",
                    () => {
                      setCommandOpen(false);
                      openAI();
                    },
                  ],
                  [
                    Search,
                    "Search notes",
                    "Jump to your library",
                    () => {
                      setCommandOpen(false);
                      searchRef.current?.focus();
                    },
                  ],
                ].map(([Icon, title, text, action]) => {
                  const I = Icon as typeof Plus;
                  return (
                    <button
                      key={title as string}
                      onClick={action as () => void}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.045]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.022]">
                        <I size={14} className="text-cyan-100/60" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white/65">
                          {title as string}
                        </div>
                        <div className="mt-0.5 text-[8px] text-white/15">
                          {text as string}
                        </div>
                      </div>
                      <ArrowRight size={12} className="text-white/10" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[1.7rem] border border-red-300/10 bg-[#070b13] p-6 shadow-[0_45px_120px_rgba(0,0,0,.85)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-300/10 bg-red-400/[0.06]">
                <Trash2 size={18} className="text-red-200/75" />
              </div>

              <h2 className="mt-5 text-xl font-black">Delete this note?</h2>
              <p className="mt-2 text-xs leading-6 text-white/22">
                “{deleteTarget.title || "Untitled Note"}” will be removed from
                your workspace.
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.022] py-3 text-xs text-white/35 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl border border-red-300/10 bg-red-400/[0.07] py-3 text-xs font-semibold text-red-100/70 hover:bg-red-400/[0.12]"
                >
                  Delete Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
