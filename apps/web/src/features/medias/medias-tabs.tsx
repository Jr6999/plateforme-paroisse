"use client";

import Image from "next/image";
import { FileText, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SAMPLE_VIDEOS = [
  { id: "v1", title: "Messe dominicale — 18 mai 2026", thumb: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80", duration: "1h12min" },
  { id: "v2", title: "Homélie de la Pentecôte", thumb: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80", duration: "18min" },
  { id: "v3", title: "Retraite spirituelle — mai 2026", thumb: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&w=800&q=80", duration: "45min" }
];

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"
];

const RECENT_HOMILIES = [
  { id: "h1", title: "Homélie — Dimanche de la Trinité", date: "26 mai 2026", duration: "22min" },
  { id: "h2", title: "Homélie — Pentecôte", date: "19 mai 2026", duration: "18min" },
  { id: "h3", title: "Homélie — Ascension", date: "12 mai 2026", duration: "16min" }
];

export const MediasTabs = () => (
  <Tabs defaultValue="videos">
    <TabsList className="mb-8 w-auto">
      <TabsTrigger value="videos">Vidéos</TabsTrigger>
      <TabsTrigger value="photos">Photos</TabsTrigger>
      <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
    </TabsList>

    {/* Videos */}
    <TabsContent value="videos">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Featured */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-night">
            <div className="relative aspect-video">
              <Image
                src={SAMPLE_VIDEOS[0].thumb}
                alt={SAMPLE_VIDEOS[0].title}
                fill
                className="object-cover opacity-70"
                sizes="(max-width:1024px) 100vw, 700px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-night shadow-lg hover:bg-gold/90 transition"
                  aria-label="Lire la vidéo"
                >
                  <Play className="h-7 w-7 translate-x-0.5" />
                </button>
              </div>
              <div className="absolute bottom-3 right-3">
                <Badge variant="default">{SAMPLE_VIDEOS[0].duration}</Badge>
              </div>
            </div>
            <div className="p-5 text-ivory">
              <h2 className="text-xl font-semibold">{SAMPLE_VIDEOS[0].title}</h2>
              <p className="mt-1 text-sm text-ivory/60">Célébration eucharistique dominicale</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {SAMPLE_VIDEOS.slice(1).map((video) => (
              <Card key={video.id} className="overflow-hidden cursor-pointer group">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={video.thumb}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                  <Badge className="absolute bottom-2 right-2">{video.duration}</Badge>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{video.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent homilies sidebar */}
        <div>
          <Card>
            <CardContent className="p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Homélies récentes</p>
              <div className="space-y-3">
                {RECENT_HOMILIES.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted cursor-pointer">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                      <Play className="h-4 w-4 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.title}</p>
                      <p className="text-xs text-muted-foreground">{h.date} · {h.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>

    {/* Photos */}
    <TabsContent value="photos">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {SAMPLE_PHOTOS.map((src, i) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-muted group cursor-pointer">
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </div>
        ))}
      </div>
    </TabsContent>

    {/* Podcasts */}
    <TabsContent value="podcasts">
      <div className="max-w-2xl space-y-4">
        {RECENT_HOMILIES.map((h) => (
          <Card key={h.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-night hover:bg-gold/90 transition"
                aria-label={`Lire ${h.title}`}
              >
                <Play className="h-4 w-4 translate-x-0.5" />
              </button>
              <div className="flex-1">
                <p className="font-medium">{h.title}</p>
                <p className="text-sm text-muted-foreground">{h.date} · {h.duration}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  </Tabs>
);
