export type ApiList<T> = {
  items: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
};

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  tags: string[];
  isPinned?: boolean;
  publishedAt?: string;
  createdAt?: string;
  author?: { id: string; name: string; avatarUrl?: string };
  community?: { id: string; name: string; slug: string; logoUrl?: string };
  _count?: { comments: number; reactions: number };
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  startAt: string;
  endAt?: string;
  location: string;
  coverImageUrl?: string;
  category?: { id: string; name: string; color: string };
  community?: { id: string; name: string; slug: string };
  _count?: { registrations: number; attendance: number };
};

export type Community = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverImageUrl?: string;
  story: string;
  mission: string;
  coordinator?: { id: string; name: string; avatarUrl?: string };
  _count?: { members: number; events: number; announcements: number };
};

export type Leader = {
  id: string;
  name: string;
  slug: string;
  title: string;
  roleType: string;
  photoUrl?: string;
  biography: string;
  serviceStart?: string;
  serviceEnd?: string;
  accomplishments: string[];
  quotes: string[];
};

export type HistoryItem = {
  id: string;
  title: string;
  slug: string;
  period?: string;
  occurredAt?: string;
  description: string;
  mediaUrl?: string;
  documentUrl?: string;
  type: string;
};

export type Catechumen = {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
  birthDate?: string;
  birthPlace?: string;
  level: string;
  progression: number;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  profession?: string;
  educationLevel?: string;
  maritalStatus?: string;
  fatherName?: string;
  motherName?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  communityId?: string;
  guardianName?: string;
  registrationDate?: string;
  status: string;
  responsible?: { id: string; name: string };
  attendance?: { id: string; status: string; kind: string; attendedAt: string }[];
};

export type SacredRhythm = {
  id: string;
  title: string;
  slug: string;
  theme: string;
  description: string;
  level: string;
  startAt: string;
  location?: string;
  instructor?: { id: string; name: string; avatarUrl?: string };
  lessons?: { id: string; title: string; content: string; position: number }[];
};

export type DashboardStats = {
  stats: {
    users: number;
    announcements: number;
    events: number;
    upcomingEvents: number;
    communities: number;
    catechumens: number;
  };
  attendanceStats: { status: string; _count: number }[];
  recentAudit: {
    id: string;
    action: string;
    entity: string;
    entityId?: string | null;
    createdAt: string;
    user?: { id: string; name: string } | null;
  }[];
};
