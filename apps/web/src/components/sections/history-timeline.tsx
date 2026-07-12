import { FileText } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { HistoryItem } from "@/types";

export const HistoryTimeline = ({ items }: { items: HistoryItem[] }) => (
  <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border md:before:left-1/2">
    {items.map((item, index) => (
      <div key={item.id} className="relative grid gap-4 pl-12 md:grid-cols-2 md:gap-8 md:pl-0">
        <span className="absolute left-1.5 top-2 h-5 w-5 rounded-full border-4 border-background bg-gold md:left-[calc(50%-10px)]" />
        <div className={index % 2 === 0 ? "md:text-right" : "md:col-start-2"}>
          <Badge variant="gold">{item.period ?? item.type}</Badge>
          <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
          {item.occurredAt && <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.occurredAt)}</p>}
        </div>
        <Card className={index % 2 === 0 ? "md:col-start-2 md:row-start-1" : ""}>
          {item.mediaUrl && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl bg-muted">
              <Image src={item.mediaUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          )}
          <CardContent className="space-y-3 pt-5">
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            {item.documentUrl && (
              <a className="inline-flex items-center gap-2 text-sm font-medium text-gold" href={item.documentUrl}>
                <FileText className="h-4 w-4" /> Document archive
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    ))}
  </div>
);
