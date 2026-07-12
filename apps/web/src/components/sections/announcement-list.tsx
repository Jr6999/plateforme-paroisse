import { MessageCircle, Pin, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/types";

export const AnnouncementList = ({ announcements }: { announcements: Announcement[] }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {announcements.map((announcement) => (
      <Card key={announcement.id} className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={announcement.isPinned ? "gold" : "muted"}>
              {announcement.isPinned && <Pin className="mr-1 h-3 w-3" />}
              {announcement.category}
            </Badge>
            {announcement.publishedAt && (
              <span className="text-xs text-muted-foreground">{formatDate(announcement.publishedAt)}</span>
            )}
          </div>
          <CardTitle className="text-xl">
            {/* Lien vers la future page détail — /annonces/[slug] */}
            <Link href={`/annonces/${announcement.slug}`}>{announcement.title}</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{announcement.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{announcement.author?.name ?? "Paroisse"}</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {announcement._count?.comments ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> {announcement._count?.reactions ?? 0}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
