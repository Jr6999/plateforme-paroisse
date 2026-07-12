import { Calendar, Megaphone, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Community } from "@/types";

export const CommunityGrid = ({ communities }: { communities: Community[] }) => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {communities.map((community) => (
      <Card key={community.id} className="overflow-hidden">
        <div className="relative aspect-[16/9] bg-muted">
          {community.coverImageUrl && (
            <Image src={community.coverImageUrl} alt={community.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          )}
        </div>
        <CardContent className="space-y-4 pt-5">
          <div>
            <h3 className="text-lg font-semibold">{community.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{community.mission}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {community._count?.members ?? 0}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {community._count?.events ?? 0}</span>
            <span className="flex items-center gap-1"><Megaphone className="h-3.5 w-3.5" /> {community._count?.announcements ?? 0}</span>
          </div>
          <Link className="text-sm font-medium text-gold" href={`/communautes/${community.slug}`}>
            Voir la communauté →
          </Link>
        </CardContent>
      </Card>
    ))}
  </div>
);
