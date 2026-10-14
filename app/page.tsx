"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { GenerationResult } from "@/lib/types";
import { buildDemoHtml } from "@/lib/demoTemplate";

type Mode = "text" | "url" | "image";
const EASE = [0.22, 1, 0.36, 1] as const;

const TABS: { id: Mode; label: string; hint: string }[] = [
  { id: "text", label: "Paste details", hint: "Type or paste anything about the business" },
  { id: "url", label: "Website link", hint: "Their current (outdated) website URL" },
  { id: "image", label: "Screenshot", hint: "Upload a photo, flyer, menu or screenshot" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<{ b64: string; type: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(GenerationResult & { _notice?: string }) | null>(null);
  const [copied, setCopied] = useState("");

  const demoHtml = useMemo(() => (result ? buildDemoHtml(result.business) : ""), [result]);

  async function onFile(file?: File) {
    if (!file) return;
    const b64 = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1] || "");
      r.readAsDataURL(file);
    });
    setImage({ b64, type: file.type || "image/png", name: file.name });
  }

  async function run(sample = false) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          sample
            ? { sample: true, mode: "text" }
            : {
                mode,
                text: mode === "text" ? text : undefined,
                url: mode === "url" ? url : undefined,
                imageBase64: mode === "image" ? image?.b64 : undefined,
                imageMediaType: mode === "image" ? image?.type : undefined,
              }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 1600);
  }

  function downloadDemo() {
    const blob = new Blob([demoHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result?.business.name.replace(/\s+/g, "-").toLowerCase() || "demo"}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const email = result?.proposal_email;
  const gmailUrl = email
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        result?.business.location.email || ""
      )}&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
    : "#";

  const canRun = mode === "text" ? text.trim() : mode === "url" ? url.trim() : !!image;

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-brand-2/20 blur-[130px]" />
      </div>

      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 font-display text-xl">P</div>
          <div>
            <h1 className="font-display text-xl tracking-wide uppercase">Pitch Studio</h1>
            <p className="text-xs text-zinc-500">demo sites & proposals, in seconds</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 sm:block">
          Private tool · Rimon Debnath
        </span>
      </motion.header>

      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="font-display text-[clamp(2.2rem,6vw,4rem)] leading-[0.95] uppercase">
          Turn any business into a <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">pitch-ready</span> demo
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Paste details, drop a link, or upload a screenshot of a shop, gym, or restaurant. Claude pulls their info, builds a premium demo website, and writes a proposal email you can send.
        </p>
      </motion.div>

      {/* input card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-ink-2/80 p-5 backdrop-blur sm:p-7"
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === t.id ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {mode === t.id && (
                <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand-2" transition={{ type: "spring", stiffness: 300, damping: 26 }} />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-3 text-xs text-zinc-500">{TABS.find((t) => t.id === mode)?.hint}</p>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {mode === "text" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="e.g. Iron House Gym, Banani. Men's & ladies gym, personal trainers, cardio zone, monthly 3000tk. Phone 017xxxxxxxx. Open 6am-11pm."
                className="w-full resize-y rounded-2xl border border-white/10 bg-ink-3 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            )}
            {mode === "url" && (
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://theircurrentsite.com"
                className="w-full rounded-2xl border border-white/10 bg-ink-3 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            )}
            {mode === "image" && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-ink-3 px-4 py-10 text-center transition hover:border-brand/60">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                <span className="text-3xl">🖼️</span>
                <span className="text-sm font-semibold">{image ? image.name : "Click to upload a screenshot"}</span>
                <span className="text-xs text-zinc-500">PNG, JPG, or WebP · storefront, menu, flyer or old site</span>
              </label>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => run(false)}
            disabled={loading || !canRun}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-3 text-sm font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generating…
              </>
            ) : (
              <>✨ Generate demo & proposal</>
            )}
          </button>
          <button onClick={() => run(true)} disabled={loading} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-40">
            Load sample
          </button>
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      </motion.section>

      {/* results */}
      <AnimatePresence>
        {result && (
          <motion.section
            id="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-10 space-y-6"
          >
            {result._notice && (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">{result._notice}</p>
            )}

            {/* profile + critique */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-ink-2 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="size-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${result.business.primary_color}, ${result.business.accent_color})` }} />
                  <div>
                    <h3 className="text-lg font-bold">{result.business.name}</h3>
                    <p className="text-xs text-zinc-500">{result.business.type} · {result.business.vibe}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-300">{result.business.tagline}</p>
                <p className="mt-3 text-sm text-zinc-400">{result.business.about}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.business.highlights.map((h) => (
                    <span key={h} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">{h}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-300">⚠️ Why they're losing customers</h3>
                <p className="text-sm text-zinc-300">{result.critique}</p>
                <p className="mt-4 text-xs text-zinc-500">Use this as the hook in your outreach — it names a real, specific pain point.</p>
              </div>
            </div>

            {/* demo preview */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-2">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/70" />
                  <span className="size-3 rounded-full bg-amber-500/70" />
                  <span className="size-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-sm font-semibold text-zinc-400">Live demo website</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadDemo} className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/5">⬇ Download .html</button>
                </div>
              </div>
              <iframe title="demo" srcDoc={demoHtml} className="h-[600px] w-full bg-black" />
            </div>

            {/* proposal email */}
            <div className="rounded-3xl border border-white/10 bg-ink-2 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-zinc-300">📧 Proposal email</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => copy("subject", email!.subject)} className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/5">
                    {copied === "subject" ? "✓ Copied" : "Copy subject"}
                  </button>
                  <button onClick={() => copy("body", email!.body)} className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/5">
                    {copied === "body" ? "✓ Copied" : "Copy body"}
                  </button>
                  <a href={gmailUrl} target="_blank" rel="noopener" className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 py-1.5 text-xs font-bold">Open in Gmail →</a>
                </div>
              </div>
              <p className="mb-2 rounded-lg bg-ink-3 px-4 py-2 text-sm font-semibold">{email!.subject}</p>
              <pre className="max-h-80 overflow-auto rounded-lg bg-ink-3 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-300">{email!.body}</pre>
              <p className="mt-3 text-xs text-zinc-500">
                Replace <code className="text-zinc-400">[DEMO LINK]</code> with the deployed demo URL before sending. Tip: download the .html above and deploy it, or host it anywhere.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
        Pitch Studio · private tool · built with Next.js, Tailwind &amp; Motion · powered by Claude
      </footer>
    </main>
  );
}
