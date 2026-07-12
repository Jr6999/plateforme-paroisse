"use client";

import type React from "react";
import { Search, X, Calendar, Megaphone, Users, Scroll } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SearchResults = {
  announcements: { id: string; title: string; slug: string; category: string }[];
  events: { id: string; title: string; slug: string; location: string }[];
  communities: { id: string; name: string; slug: string; mission: string }[];
  history: { id: string; title: string; slug: string; period?: string }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

export const SearchDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const hasResults = results && (
    results.announcements.length + results.events.length +
    results.communities.length + results.history.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une annonce, un événement, une communauté..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />}
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!query && (
            <p className="py-8 text-center text-sm text-muted-foreground">Commencez à taper pour rechercher…</p>
          )}
          {query.length >= 2 && !hasResults && !loading && (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun résultat pour « {query} »</p>
          )}
          {hasResults && results && (
            <div className="space-y-4">
              {results.announcements.length > 0 && (
                <ResultGroup label="Annonces" Icon={Megaphone}>
                  {results.announcements.map((a) => (
                    <ResultItem key={a.id} href={`/annonces/${a.slug}`} title={a.title} sub={a.category} onClose={onClose} />
                  ))}
                </ResultGroup>
              )}
              {results.events.length > 0 && (
                <ResultGroup label="Événements" Icon={Calendar}>
                  {results.events.map((e) => (
                    <ResultItem key={e.id} href={`/evenements/${e.slug}`} title={e.title} sub={e.location} onClose={onClose} />
                  ))}
                </ResultGroup>
              )}
              {results.communities.length > 0 && (
                <ResultGroup label="Communautés" Icon={Users}>
                  {results.communities.map((c) => (
                    <ResultItem key={c.id} href={`/communautes/${c.slug}`} title={c.name} sub={c.mission} onClose={onClose} />
                  ))}
                </ResultGroup>
              )}
              {results.history.length > 0 && (
                <ResultGroup label="Histoire" Icon={Scroll}>
                  {results.history.map((h) => (
                    <ResultItem key={h.id} href={`/histoire#${h.slug}`} title={h.title} sub={h.period} onClose={onClose} />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultGroup = ({ label, Icon, children }: { label: string; Icon: React.FC<{ className?: string }>; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 px-2 py-1">
      <Icon className="h-3.5 w-3.5 text-gold" />
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const ResultItem = ({ href, title, sub, onClose }: { href: string; title: string; sub?: string; onClose: () => void }) => (
  <Link
    href={href}
    onClick={onClose}
    className="flex flex-col rounded-lg px-3 py-2 hover:bg-muted"
  >
    <span className="text-sm font-medium">{title}</span>
    {sub && <span className="text-xs text-muted-foreground line-clamp-1">{sub}</span>}
  </Link>
);
