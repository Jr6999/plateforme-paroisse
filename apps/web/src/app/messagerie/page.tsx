"use client";

import { Send, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isGroup?: boolean;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  time: string;
};

const SAMPLE_CONVOS: Conversation[] = [
  { id: "c1", name: "Communauté Jeunesse Lumière", lastMessage: "Réunion ce samedi à 10h", time: "10:30", unread: 3, isGroup: true },
  { id: "c2", name: "Chorale Sainte Cécile", lastMessage: "Les répétitions reprennent lundi", time: "Hier", isGroup: true },
  { id: "c3", name: "Soeur Claire Mbala", lastMessage: "Merci pour les documents", time: "Hier" },
  { id: "c4", name: "Jean-Paul Nsimba", lastMessage: "À bientôt !", time: "Mer." },
  { id: "c5", name: "Secrétariat paroissial", lastMessage: "Votre inscription est confirmée.", time: "Mar." }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "other", content: "Bonjour à tous ! La prochaine réunion de la jeunesse aura lieu ce samedi à 10h.", time: "10:15" },
    { id: "m2", senderId: "other", content: "Apportez votre Bible et votre carnet de notes.", time: "10:16" },
    { id: "m3", senderId: "me", content: "Présent ! Je viendrai avec deux amis.", time: "10:30" }
  ],
  c2: [
    { id: "m4", senderId: "other", content: "Attention : les répétitions de chœur reprennent lundi prochain à 17h.", time: "Hier" }
  ],
  c3: [
    { id: "m5", senderId: "me", content: "Soeur Claire, voici les documents pour les inscriptions.", time: "Hier" },
    { id: "m6", senderId: "other", content: "Merci pour les documents, je les transmets au secrétariat.", time: "Hier" }
  ]
};

export default function MessagingPage() {
  const [selected, setSelected] = useState<string>("c1");
  const [text, setText] = useState("");
  // État local des messages mutable pour l'envoi UI
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convo = SAMPLE_CONVOS.find((c) => c.id === selected);
  const messages = allMessages[selected] ?? [];

  // Scroll automatique vers le bas quand un nouveau message arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selected]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: "me",
      content: trimmed,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    // Mise à jour locale — TODO: POST /api/messages quand le backend le supporte
    setAllMessages((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] ?? []), newMsg]
    }));
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] overflow-hidden">
      {/* Conversation list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h1 className="mb-3 font-semibold">Messagerie</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher…" className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {SAMPLE_CONVOS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left hover:bg-muted/60 transition",
                selected === c.id && "bg-muted"
              )}
            >
              <Avatar name={c.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="truncate text-xs text-muted-foreground">{c.lastMessage}</span>
                  {c.unread != null && c.unread > 0 && (
                    <span className="shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-night">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
          <Avatar name={convo?.name ?? ""} size="md" />
          <div>
            <p className="font-medium">{convo?.name}</p>
            <p className="text-xs text-muted-foreground">
              {convo?.isGroup ? "Groupe communautaire" : "Message privé"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg) => {
            const isMe = msg.senderId === "me";
            return (
              <div key={msg.id} className={cn("flex items-end gap-2", isMe && "flex-row-reverse")}>
                {!isMe && <Avatar name={convo?.name ?? ""} size="sm" />}
                <div className={cn(
                  "max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-6",
                  isMe ? "bg-gold text-night rounded-br-sm" : "bg-muted rounded-bl-sm"
                )}>
                  {msg.content}
                  <p className="mt-1 text-[10px] opacity-60 text-right">{msg.time}</p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun message. Commencez la conversation !
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire un message…"
              aria-label="Message"
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="gold"
              size="icon"
              disabled={!text.trim()}
              onClick={handleSend}
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
