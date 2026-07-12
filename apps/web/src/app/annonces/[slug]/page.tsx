import { MessageCircle, Pin, ThumbsUp, Tag, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { CommentSection } from "@/features/announcements/comment-section";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

async function getAnnouncement(slug: string) {
  try {
    const res = await fetch(`${API_URL}/announcements/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.announcement;
  } catch { return null; }
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) notFound();

  return (
    <div className="container py-10 lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
      {/* Main content */}
      <article className="min-w-0 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={announcement.isPinned ? "gold" : "muted"}>
              {announcement.isPinned && <Pin className="mr-1 h-3 w-3" />}
              {announcement.category}
            </Badge>
            {announcement.publishedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(announcement.publishedAt)}
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">{announcement.title}</h1>
          <p className="text-lg leading-7 text-muted-foreground">{announcement.excerpt}</p>
          {/* Author */}
          {announcement.author && (
            <div className="flex items-center gap-3 pt-2">
              <Avatar src={announcement.author.avatarUrl} name={announcement.author.name} size="md" />
              <div>
                <p className="text-sm font-medium">{announcement.author.name}</p>
                {announcement.community && (
                  <p className="text-xs text-muted-foreground">{announcement.community.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap leading-7">{announcement.content}</p>
        </div>

        {/* Tags */}
        {announcement.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {announcement.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 border-y border-border py-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ThumbsUp className="h-4 w-4" /> {announcement._count?.reactions ?? 0} réactions
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" /> {announcement._count?.comments ?? 0} commentaires
          </span>
        </div>

        {/* Comments */}
        <CommentSection
          announcementId={announcement.id}
          comments={announcement.comments ?? []}
        />
      </article>

      {/* Sidebar */}
      <aside className="hidden space-y-6 lg:block">
        {announcement.community && (
          <Card>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Communauté</p>
            </CardHeader>
            <CardContent>
              <Link href={`/communautes/${announcement.community.slug}`} className="font-medium text-gold hover:underline">
                {announcement.community.name}
              </Link>
            </CardContent>
          </Card>
        )}
        {announcement.documents?.length > 0 && (
          <Card>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents joints</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {announcement.documents.map((doc: { id: string; title: string; url: string }) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  📎 {doc.title}
                </a>
              ))}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-5">
            <Link href="/annonces" className="text-sm font-medium text-gold hover:underline">
              ← Retour aux annonces
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
