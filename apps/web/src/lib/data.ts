import type {
  Announcement,
  Catechumen,
  Community,
  DashboardStats,
  Event,
  HistoryItem,
  Leader,
  SacredRhythm
} from "@/types";

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const fallbackAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Neuvaine preparatoire a la solennite du Saint Sacrement",
    slug: "neuvaine-saint-sacrement",
    excerpt: "Neuf jours de priere, d'adoration et d'enseignements pour toute la paroisse.",
    content:
      "La neuvaine aura lieu chaque soir a 17h30. Les communautes assurent l'animation selon le calendrier pastoral.",
    category: "Liturgie",
    tags: ["adoration", "priere", "liturgie"],
    isPinned: true,
    publishedAt: "2026-05-19T12:00:00.000Z",
    author: { id: "u1", name: "Secretariat paroissial" },
    community: { id: "c1", name: "Chorale Sainte Cecile", slug: "chorale-sainte-cecile" },
    _count: { comments: 8, reactions: 42 }
  },
  {
    id: "ann-2",
    title: "Inscriptions au parcours catechumenal 2026",
    slug: "inscriptions-parcours-catechumenal-2026",
    excerpt: "Les inscriptions sont ouvertes pour les enfants, jeunes et adultes.",
    content:
      "Les familles peuvent se presenter au bureau paroissial avec les informations administratives requises.",
    category: "Catechese",
    tags: ["catechese", "inscription"],
    publishedAt: "2026-05-18T10:00:00.000Z",
    author: { id: "u2", name: "Equipe catechese" },
    _count: { comments: 3, reactions: 21 }
  }
];

export const fallbackEvents: Event[] = [
  {
    id: "evt-1",
    title: "Messe solennelle et procession",
    slug: "messe-solennelle-procession",
    description:
      "Celebration solennelle suivie d'une procession avec les mouvements paroissiaux.",
    status: "SCHEDULED",
    startAt: "2026-06-07T08:00:00.000Z",
    endAt: "2026-06-07T11:00:00.000Z",
    location: "Cathedrale - grande nef",
    coverImageUrl: image("photo-1494891848038-7bd202a2afeb"),
    category: { id: "cat-1", name: "Celebration liturgique", color: "#c8a45d" },
    community: { id: "c1", name: "Chorale Sainte Cecile", slug: "chorale-sainte-cecile" },
    _count: { registrations: 112, attendance: 0 }
  },
  {
    id: "evt-2",
    title: "Session biblique pour les jeunes",
    slug: "session-biblique-jeunes",
    description: "Journee d'enseignement, de partage et de priere autour de l'Evangile.",
    status: "SCHEDULED",
    startAt: "2026-06-22T09:00:00.000Z",
    endAt: "2026-06-22T15:00:00.000Z",
    location: "Salle Saint Joseph",
    coverImageUrl: image("photo-1523240795612-9a054b0db644"),
    category: { id: "cat-2", name: "Formation", color: "#4b6b88" },
    community: { id: "c2", name: "Jeunesse Lumiere", slug: "jeunesse-lumiere" },
    _count: { registrations: 46, attendance: 0 }
  }
];

export const fallbackCommunities: Community[] = [
  {
    id: "c1",
    name: "Chorale Sainte Cecile",
    slug: "chorale-sainte-cecile",
    logoUrl: image("photo-1516280440614-37939bbacd81"),
    coverImageUrl: image("photo-1507838153414-b4b713384a76"),
    story:
      "La chorale accompagne les grandes celebrations de la cathedrale et transmet la priere par le chant.",
    mission: "Servir la liturgie, former les voix et unir les fideles autour du chant sacre.",
    coordinator: { id: "u3", name: "Jean-Paul Nsimba" },
    _count: { members: 38, events: 6, announcements: 4 }
  },
  {
    id: "c2",
    name: "Jeunesse Lumiere",
    slug: "jeunesse-lumiere",
    logoUrl: image("photo-1529156069898-49953e39b3ac"),
    coverImageUrl: image("photo-1511632765486-a01980e01a18"),
    story: "Un mouvement de jeunes engage dans la priere, la charite et le service paroissial.",
    mission: "Former des jeunes disciples capables de servir l'Eglise et la cite avec joie.",
    coordinator: { id: "u3", name: "Jean-Paul Nsimba" },
    _count: { members: 64, events: 8, announcements: 7 }
  }
];

export const fallbackLeaders: Leader[] = [
  {
    id: "l1",
    name: "Abbe Michel Kabasele",
    slug: "abbe-michel-kabasele",
    title: "Cure actuel",
    roleType: "cure",
    photoUrl: image("photo-1560250097-0b93528c311a"),
    biography:
      "Pretre diocesan, il accompagne la cathedrale dans la liturgie, la formation et le service des familles.",
    serviceStart: "2022-09-01T00:00:00.000Z",
    accomplishments: ["Relance des formations bibliques", "Structuration des communautes"],
    quotes: ["Servir Dieu, c'est apprendre a accueillir chaque personne."]
  },
  {
    id: "l2",
    name: "Mgr Antoine Kalema",
    slug: "mgr-antoine-kalema",
    title: "Eveque emerite",
    roleType: "eveque",
    photoUrl: image("photo-1556157382-97eda2d62296"),
    biography: "Pasteur attentif a la transmission de la foi et a la memoire ecclesiale.",
    serviceStart: "2004-04-18T00:00:00.000Z",
    serviceEnd: "2021-11-30T00:00:00.000Z",
    accomplishments: ["Restauration du choeur", "Creation du service archives"],
    quotes: ["La memoire de l'Eglise nourrit son avenir."]
  }
];

export const fallbackHistory: HistoryItem[] = [
  {
    id: "h1",
    title: "Fondation de la paroisse cathedrale",
    slug: "fondation-paroisse-cathedrale",
    period: "Origines",
    occurredAt: "1956-08-15T00:00:00.000Z",
    description:
      "La communaute est erigee autour d'un premier noyau de fideles, avec la volonte de devenir un centre spirituel et social pour la ville.",
    mediaUrl: image("photo-1507692049790-de58290a4334"),
    type: "fondation"
  },
  {
    id: "h2",
    title: "Premiere grande renovation",
    slug: "premiere-grande-renovation",
    period: "Patrimoine",
    occurredAt: "1989-05-01T00:00:00.000Z",
    description:
      "Les travaux consolident la nef, restaurent les vitraux et rendent l'espace liturgique plus accueillant.",
    mediaUrl: image("photo-1438032005730-c779502df39b"),
    type: "renovation"
  },
  {
    id: "h3",
    title: "Ouverture des archives pastorales",
    slug: "ouverture-archives-pastorales",
    period: "Memoire",
    occurredAt: "2018-01-20T00:00:00.000Z",
    description:
      "Une equipe est chargee de numeriser les documents, photos et temoignages de la paroisse.",
    type: "archive"
  }
];

export const fallbackCatechumens: Catechumen[] = [
  {
    id: "cat-1",
    firstName: "Esther",
    lastName: "Mbuyi",
    sex: "F",
    level: "Niveau 1",
    progression: 38,
    phone: "+243 000 000 003",
    status: "ACTIVE",
    responsible: { id: "u2", name: "Soeur Claire Mbala" },
    attendance: [{ id: "a1", status: "PRESENT", kind: "formation", attendedAt: "2026-05-11" }]
  },
  {
    id: "cat-2",
    firstName: "Daniel",
    lastName: "Lukusa",
    sex: "M",
    level: "Niveau 2",
    progression: 72,
    status: "ACTIVE",
    responsible: { id: "u2", name: "Soeur Claire Mbala" },
    attendance: [{ id: "a2", status: "LATE", kind: "culte dimanche", attendedAt: "2026-05-17" }]
  }
];

export const fallbackRhythms: SacredRhythm[] = [
  {
    id: "r1",
    title: "Rythme sacre - Initiation a la foi",
    slug: "rythme-sacre-initiation-foi",
    theme: "Credo, priere et vie sacramentelle",
    description: "Parcours progressif pour entrer dans l'intelligence de la foi et la vie liturgique.",
    level: "Niveau 1",
    startAt: "2026-06-01T15:00:00.000Z",
    location: "Salle catechese",
    instructor: { id: "u2", name: "Soeur Claire Mbala" },
    lessons: [
      { id: "le1", title: "Dieu se revele", content: "Introduction a la Revelation.", position: 1 },
      { id: "le2", title: "Le signe de croix", content: "Geste, priere trinitaire et foi.", position: 2 }
    ]
  }
];

export const fallbackDashboard: DashboardStats = {
  stats: {
    users: 1240,
    announcements: 86,
    events: 42,
    upcomingEvents: 9,
    communities: 12,
    catechumens: 148
  },
  attendanceStats: [
    { status: "PRESENT", _count: 420 },
    { status: "ABSENT", _count: 58 },
    { status: "EXCUSED", _count: 31 },
    { status: "LATE", _count: 19 }
  ],
  recentAudit: [
    { id: "log-1", action: "announcement.create", entity: "Announcement", createdAt: "2026-05-19" },
    { id: "log-2", action: "attendance.create", entity: "Attendance", createdAt: "2026-05-18" }
  ]
};
