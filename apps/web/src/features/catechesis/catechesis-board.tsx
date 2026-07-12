import { BookOpen, CheckCircle2, Clock, UserCheck, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Catechumen, SacredRhythm } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "text-green-600",
  ABSENT: "text-red-500",
  EXCUSED: "text-yellow-500",
  LATE: "text-purple-500"
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Présent",
  ABSENT: "Absent",
  EXCUSED: "Excusé",
  LATE: "En retard"
};

export const CatechesisBoard = ({
  catechumens,
  rhythms
}: {
  catechumens: Catechumen[];
  rhythms: SacredRhythm[];
}) => {
  const average = Math.round(
    catechumens.reduce((sum, c) => sum + c.progression, 0) / Math.max(1, catechumens.length)
  );

  const total = catechumens.length;
  const active = catechumens.filter((c) => c.status === "ACTIVE").length;

  // Build attendance rate from last attendance entries
  const allAttendances = catechumens.flatMap((c) => c.attendance ?? []);
  const presentCount = allAttendances.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = allAttendances.length
    ? Math.round((presentCount / allAttendances.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Catéchumènes", value: total, sub: `${active} actifs`, Icon: UserCheck },
          { label: "Progression moy.", value: `${average}%`, sub: "sur 100%", Icon: TrendingUp },
          { label: "Rythmes sacrés", value: rhythms.length, sub: "parcours", Icon: BookOpen },
          { label: "Taux de présence", value: `${attendanceRate}%`, sub: "90 derniers jours", Icon: CheckCircle2 }
        ].map(({ label, value, sub, Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-4 text-2xl font-semibold">{value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="catechumens">
        <TabsList>
          <TabsTrigger value="catechumens">Catéchumènes</TabsTrigger>
          <TabsTrigger value="absences">Absences</TabsTrigger>
          <TabsTrigger value="niveaux">Niveaux</TabsTrigger>
          <TabsTrigger value="rythmes">Rythmes sacrés</TabsTrigger>
        </TabsList>

        {/* Catechumens list */}
        <TabsContent value="catechumens" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader><CardTitle className="text-base">Suivi individuel</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {catechumens.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${c.firstName} ${c.lastName}`} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{c.firstName} {c.lastName}</p>
                          <span className="text-sm font-semibold text-gold">{c.progression}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="muted" className="text-xs">{c.level}</Badge>
                          <span className={`text-xs ${c.status === "ACTIVE" ? "text-green-600" : "text-muted-foreground"}`}>
                            {c.status === "ACTIVE" ? "Actif" : c.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={c.progression} className="mt-3 h-1.5" />
                    {c.attendance?.length && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Dernière présence :</span>
                        <span className={`text-xs font-medium ${STATUS_COLORS[c.attendance[0].status]}`}>
                          {STATUS_LABELS[c.attendance[0].status]} — {formatDate(c.attendance[0].attendedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Responsible catechists */}
            <Card>
              <CardHeader><CardTitle className="text-base">Catéchistes responsables</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Array.from(new Map(catechumens.filter((c) => c.responsible).map((c) => [c.responsible!.id, c.responsible!])).values()).map((resp) => (
                  <div key={resp.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar name={resp.name} size="md" />
                    <div>
                      <p className="text-sm font-medium">{resp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {catechumens.filter((c) => c.responsible?.id === resp.id).length} catéchumène(s)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Absences */}
        <TabsContent value="absences" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Répartition des présences</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {["PRESENT", "ABSENT", "EXCUSED", "LATE"].map((status) => {
                  const count = allAttendances.filter((a) => a.status === status).length;
                  const pct = allAttendances.length ? Math.round((count / allAttendances.length) * 100) : 0;
                  return (
                    <div key={status} className="rounded-xl border border-border p-4 text-center">
                      <p className={`text-2xl font-semibold ${STATUS_COLORS[status]}`}>{count}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Niveaux */}
        <TabsContent value="niveaux" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Répartition par niveau</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Array.from(new Set(catechumens.map((c) => c.level))).map((level) => {
                const inLevel = catechumens.filter((c) => c.level === level);
                const avgProg = inLevel.length
                  ? Math.round(inLevel.reduce((s, c) => s + c.progression, 0) / inLevel.length)
                  : 0;
                return (
                  <div key={level} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gold" />
                        <span className="font-medium">{level}</span>
                        <Badge variant="muted" className="text-xs">{inLevel.length} catéchumènes</Badge>
                      </div>
                      <span className="text-sm font-semibold">{avgProg}% moy.</span>
                    </div>
                    <Progress value={avgProg} className="mt-3 h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rythmes sacrés */}
        <TabsContent value="rythmes" className="mt-6">
          <div className="grid gap-5 md:grid-cols-2">
            {rhythms.map((rhythm) => (
              <Card key={rhythm.id}>
                <CardHeader>
                  <Badge variant="gold" className="w-fit">{rhythm.level}</Badge>
                  <CardTitle className="text-base mt-2">{rhythm.title}</CardTitle>
                  <p className="text-sm text-gold">{rhythm.theme}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">{rhythm.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {rhythm.location && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rhythm.location}</span>}
                    {rhythm.instructor && <span>Instructeur : {rhythm.instructor.name}</span>}
                    <span>{formatDate(rhythm.startAt)}</span>
                  </div>
                  {rhythm.lessons && rhythm.lessons.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leçons</p>
                      {rhythm.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">{lesson.position}</span>
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
