import { Quote } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Leader } from "@/types";

export const LeaderGrid = ({ leaders }: { leaders: Leader[] }) => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {leaders.map((leader) => (
      <Card key={leader.id} className="overflow-hidden">
        <div className="relative aspect-[4/3] bg-muted">
          {leader.photoUrl && (
            <Image src={leader.photoUrl} alt={leader.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          )}
        </div>
        <CardContent className="space-y-4 pt-5">
          <div>
            <Badge variant="muted">{leader.roleType}</Badge>
            <h3 className="mt-3 text-xl font-semibold">{leader.name}</h3>
            <p className="text-sm text-gold">{leader.title}</p>
          </div>
          <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{leader.biography}</p>
          <p className="text-xs text-muted-foreground">
            {leader.serviceStart && formatDate(leader.serviceStart, { year: "numeric" })}
            {leader.serviceEnd ? ` - ${formatDate(leader.serviceEnd, { year: "numeric" })}` : " - aujourd'hui"}
          </p>
          {leader.quotes?.[0] && (
            <blockquote className="flex gap-2 text-sm italic text-muted-foreground">
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {leader.quotes[0]}
            </blockquote>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);
