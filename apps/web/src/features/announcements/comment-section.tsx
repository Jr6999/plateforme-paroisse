"use client";

import { MessageCircle, Reply, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string };
  replies?: Comment[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

export const CommentSection = ({
  announcementId,
  comments: initial
}: {
  announcementId: string;
  comments: Comment[];
}) => {
  const { accessToken } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(initial);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const postComment = async (content: string, parentId?: string) => {
    if (!accessToken) { toast.error("Connectez-vous pour commenter."); return; }
    if (content.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ announcementId, parentId, content: content.trim() })
      });
      if (!res.ok) throw new Error();
      const { comment } = await res.json();
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), comment] } : c)
        );
        setReplyTo(null);
        setReplyText("");
      } else {
        setComments((prev) => [comment, ...prev]);
        setText("");
      }
      toast.success("Commentaire publié.");
    } catch { toast.error("Impossible de publier le commentaire."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <MessageCircle className="h-5 w-5 text-gold" />
        Commentaires ({comments.length})
      </h2>

      {/* New comment */}
      <div className="space-y-3 rounded-xl border border-border p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Partagez votre réflexion…"
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <div className="flex justify-end">
          <Button variant="gold" size="sm" disabled={loading || text.trim().length < 2} onClick={() => postComment(text)}>
            Publier
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              comment={comment}
              onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            />
            {/* Replies */}
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="ml-10">
                <CommentItem comment={reply} />
              </div>
            ))}
            {/* Reply input */}
            {replyTo === comment.id && (
              <div className="ml-10 space-y-2 rounded-xl border border-border p-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Répondre…"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>Annuler</Button>
                  <Button variant="gold" size="sm" disabled={loading || replyText.trim().length < 2} onClick={() => postComment(replyText, comment.id)}>
                    Répondre
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun commentaire pour l'instant. Soyez le premier !</p>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, onReply }: { comment: Comment; onReply?: () => void }) => (
  <div className="flex gap-3">
    <Avatar src={comment.author.avatarUrl} name={comment.author.name} size="sm" />
    <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{comment.author.name}</span>
        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="mt-1.5 text-sm leading-6">{comment.content}</p>
      {onReply && (
        <button onClick={onReply} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Reply className="h-3.5 w-3.5" /> Répondre
        </button>
      )}
    </div>
  </div>
);
