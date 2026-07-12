import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const PageHeading = ({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) => (
  <section className={cn("border-b border-border bg-muted/35", className)}>
    <div className="container py-12 md:py-16">
      <Badge variant="gold">{eyebrow}</Badge>
      <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold tracking-normal md:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
    </div>
  </section>
);
