import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth/password.js";
import { toSlug } from "../src/common/sanitize.js";

const prisma = new PrismaClient();

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const roles = [
  ["super_admin", "Super Admin"],
  ["administrateur", "Administrateur"],
  ["responsable_communautaire", "Responsable communaute"],
  ["catechiste", "Catechiste"],
  ["membre", "Utilisateur membre"],
  ["visiteur", "Visiteur"]
] as const;

const permissions = [
  ["manage.users", "Gerer les utilisateurs"],
  ["manage.content", "Gerer les contenus"],
  ["manage.events", "Gerer les evenements"],
  ["manage.communities", "Gerer les communautes"],
  ["manage.catechesis", "Gerer la catechese"],
  ["read.dashboard", "Consulter le dashboard"],
  ["comment.announcements", "Commenter les annonces"]
] as const;

const main = async () => {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.document.deleteMany(),
    prisma.mediaAsset.deleteMany(),
    prisma.gallery.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.sacredLesson.deleteMany(),
    prisma.sacredRhythm.deleteMany(),
    prisma.sacramentRecord.deleteMany(),
    (prisma as any).catechumenDocument?.deleteMany() ?? Promise.resolve(),
    prisma.catechumen.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.event.deleteMany(),
    prisma.reaction.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.eventCategory.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.communityMember.deleteMany(),
    prisma.community.deleteMany(),
    prisma.leader.deleteMany(),
    prisma.parishHistory.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany()
  ]);

  const createdPermissions = new Map<string, string>();
  for (const [key, label] of permissions) {
    const permission = await prisma.permission.create({ data: { key, label } });
    createdPermissions.set(key, permission.id);
  }

  const createdRoles = new Map<string, string>();
  for (const [key, label] of roles) {
    const role = await prisma.role.create({ data: { key, label } });
    createdRoles.set(key, role.id);
  }

  const grant = async (roleKey: string, permissionKeys: string[]) => {
    const roleId = createdRoles.get(roleKey)!;
    await prisma.rolePermission.createMany({
      data: permissionKeys.map((permissionKey) => ({
        roleId,
        permissionId: createdPermissions.get(permissionKey)!
      }))
    });
  };

  await grant("super_admin", permissions.map(([key]) => key));
  await grant("administrateur", [
    "manage.users",
    "manage.content",
    "manage.events",
    "manage.communities",
    "manage.catechesis",
    "read.dashboard",
    "comment.announcements"
  ]);
  await grant("responsable_communautaire", [
    "manage.content",
    "manage.events",
    "manage.communities",
    "read.dashboard",
    "comment.announcements"
  ]);
  await grant("catechiste", ["manage.catechesis", "read.dashboard", "comment.announcements"]);
  await grant("membre", ["comment.announcements"]);

  const passwordHash = await hashPassword("Paroisse@2026");
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@paroisse.local",
      name: "Administrateur Cathedrale",
      passwordHash,
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: createdRoles.get("super_admin")! } }
    }
  });
  const catechist = await prisma.user.create({
    data: {
      email: "catechiste@paroisse.local",
      name: "Soeur Claire Mbala",
      passwordHash,
      phone: "+243 000 000 001",
      roles: { create: { roleId: createdRoles.get("catechiste")! } }
    }
  });
  const coordinator = await prisma.user.create({
    data: {
      email: "communaute@paroisse.local",
      name: "Jean-Paul Nsimba",
      passwordHash,
      phone: "+243 000 000 002",
      roles: { create: { roleId: createdRoles.get("responsable_communautaire")! } }
    }
  });
  const member = await prisma.user.create({
    data: {
      email: "membre@paroisse.local",
      name: "Marie Kavira",
      passwordHash,
      roles: { create: { roleId: createdRoles.get("membre")! } }
    }
  });

  const massCategory = await prisma.eventCategory.create({
    data: { name: "Celebration liturgique", slug: "celebration-liturgique", color: "#c8a45d" }
  });
  const formationCategory = await prisma.eventCategory.create({
    data: { name: "Formation", slug: "formation", color: "#4b6b88" }
  });

  const choir = await prisma.community.create({
    data: {
      name: "Chorale Sainte Cecile",
      slug: "chorale-sainte-cecile",
      logoUrl: image("photo-1516280440614-37939bbacd81"),
      coverImageUrl: image("photo-1507838153414-b4b713384a76"),
      story:
        "La chorale accompagne les grandes celebrations de la cathedrale et transmet la priere par le chant depuis plusieurs generations.",
      mission:
        "Servir la liturgie, former les voix et unir les fideles autour d'un repertoire sacre vivant.",
      coordinatorId: coordinator.id,
      members: {
        create: [
          { userId: coordinator.id, role: "coordinateur" },
          { userId: member.id, role: "soprano" }
        ]
      }
    }
  });

  const youth = await prisma.community.create({
    data: {
      name: "Jeunesse Lumiere",
      slug: "jeunesse-lumiere",
      logoUrl: image("photo-1529156069898-49953e39b3ac"),
      coverImageUrl: image("photo-1511632765486-a01980e01a18"),
      story:
        "Un mouvement de jeunes engage dans la priere, la charite, la formation humaine et le service paroissial.",
      mission: "Former des jeunes disciples capables de servir l'Eglise et la cite avec joie.",
      coordinatorId: coordinator.id,
      members: { create: { userId: coordinator.id, role: "encadreur" } }
    }
  });

  await prisma.leader.createMany({
    data: [
      {
        name: "Abbe Michel Kabasele",
        slug: "abbe-michel-kabasele",
        title: "Cure actuel",
        roleType: "cure",
        photoUrl: image("photo-1560250097-0b93528c311a"),
        biography:
          "Pretre diocesain, il accompagne la cathedrale dans la liturgie, la formation et le service des familles.",
        serviceStart: new Date("2022-09-01"),
        accomplishments: ["Relance des formations bibliques", "Structuration des communautes"],
        quotes: ["Servir Dieu, c'est apprendre a accueillir chaque personne."]
      },
      {
        name: "Mgr Antoine Kalema",
        slug: "mgr-antoine-kalema",
        title: "Eveque emerite",
        roleType: "eveque",
        photoUrl: image("photo-1556157382-97eda2d62296"),
        biography:
          "Pasteur attentif a la transmission de la foi, il a soutenu la renovation pastorale de la cathedrale.",
        serviceStart: new Date("2004-04-18"),
        serviceEnd: new Date("2021-11-30"),
        accomplishments: ["Restauration du choeur", "Creation du service archives"],
        quotes: ["La memoire de l'Eglise nourrit son avenir."],
        sortOrder: 1
      }
    ]
  });

  await prisma.parishHistory.createMany({
    data: [
      {
        title: "Fondation de la paroisse cathedrale",
        slug: "fondation-paroisse-cathedrale",
        period: "Origines",
        occurredAt: new Date("1956-08-15"),
        description:
          "La communaute est erigee autour d'un premier noyau de fideles, avec la volonte de devenir un centre spirituel et social pour la ville.",
        mediaUrl: image("photo-1507692049790-de58290a4334"),
        type: "fondation"
      },
      {
        title: "Premiere grande renovation",
        slug: "premiere-grande-renovation",
        period: "Patrimoine",
        occurredAt: new Date("1989-05-01"),
        description:
          "Les travaux consolident la nef, restaurent les vitraux et rendent l'espace liturgique plus accueillant.",
        mediaUrl: image("photo-1438032005730-c779502df39b"),
        type: "renovation"
      },
      {
        title: "Ouverture des archives pastorales",
        slug: "ouverture-archives-pastorales",
        period: "Memoire",
        occurredAt: new Date("2018-01-20"),
        description:
          "La paroisse met en place une equipe chargee de numeriser les documents, photos et temoignages.",
        type: "archive"
      }
    ]
  });

  const announcement = await prisma.announcement.create({
    data: {
      title: "Neuvaine preparatoire a la solennite du Saint Sacrement",
      slug: "neuvaine-saint-sacrement",
      excerpt:
        "Toute la paroisse est invitee a neuf jours de priere, d'adoration et d'enseignements.",
      content:
        "La neuvaine aura lieu chaque soir a 17h30. Les communautes sont invitees a assurer l'animation selon le calendrier qui sera partage par le secretariat.",
      category: "Liturgie",
      tags: ["adoration", "priere", "liturgie"],
      status: "PUBLISHED",
      isPinned: true,
      publishedAt: new Date(),
      authorId: superAdmin.id,
      communityId: choir.id,
      comments: {
        create: {
          content: "La chorale confirme sa disponibilite pour l'animation du troisieme jour.",
          authorId: member.id
        }
      }
    }
  });

  await prisma.announcement.create({
    data: {
      title: "Inscriptions au parcours catechumenal 2026",
      slug: "inscriptions-parcours-catechumenal-2026",
      excerpt: "Les inscriptions sont ouvertes pour les enfants, jeunes et adultes.",
      content:
        "Les familles peuvent se presenter au bureau paroissial avec une piece d'identite, deux photos et les informations de contact du responsable familial.",
      category: "Catechese",
      tags: ["catechese", "inscription", "formation"],
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: catechist.id
    }
  });

  const event = await prisma.event.create({
    data: {
      title: "Messe solennelle et procession",
      slug: "messe-solennelle-procession",
      description:
        "Celebration solennelle suivie d'une procession dans le quartier, avec participation des mouvements paroissiaux.",
      status: "SCHEDULED",
      startAt: new Date("2026-06-07T08:00:00.000Z"),
      endAt: new Date("2026-06-07T11:00:00.000Z"),
      location: "Cathedrale - grande nef",
      coverImageUrl: image("photo-1494891848038-7bd202a2afeb"),
      categoryId: massCategory.id,
      communityId: choir.id,
      registrations: { create: { userId: member.id, guests: 2 } }
    }
  });

  await prisma.event.create({
    data: {
      title: "Session biblique pour les jeunes",
      slug: "session-biblique-jeunes",
      description:
        "Une journee d'enseignement, de partage et de priere pour approfondir l'Evangile selon saint Marc.",
      status: "SCHEDULED",
      startAt: new Date("2026-06-22T09:00:00.000Z"),
      endAt: new Date("2026-06-22T15:00:00.000Z"),
      location: "Salle Saint Joseph",
      coverImageUrl: image("photo-1523240795612-9a054b0db644"),
      categoryId: formationCategory.id,
      communityId: youth.id
    }
  });

  const rhythm = await prisma.sacredRhythm.create({
    data: {
      title: "Rythme sacre - Initiation a la foi",
      slug: "rythme-sacre-initiation-foi",
      theme: "Credo, priere et vie sacramentelle",
      description:
        "Parcours progressif pour aider les catechumenes a entrer dans l'intelligence de la foi et la vie liturgique.",
      level: "Niveau 1",
      startAt: new Date("2026-06-01T15:00:00.000Z"),
      endAt: new Date("2026-08-30T16:30:00.000Z"),
      location: "Salle catechese",
      instructorId: catechist.id,
      lessons: {
        create: [
          {
            title: "Dieu se revele",
            content: "Introduction a la Revelation et a l'ecoute de la Parole.",
            position: 1
          },
          {
            title: "Le signe de croix",
            content: "Comprendre le geste, la priere trinitaire et la profession de foi.",
            position: 2
          }
        ]
      }
    }
  });

  const catechumen = await prisma.catechumen.create({
    data: {
      firstName: "Esther",
      lastName: "Mbuyi",
      sex: "F",
      birthDate: new Date("2014-03-12"),
      phone: "+243 000 000 003",
      address: "Avenue de la Mission",
      level: "Niveau 1",
      progression: 38,
      responsibleId: catechist.id,
      sacraments: {
        create: [{ sacrament: "Accueil en catechumenat", receivedAt: new Date("2026-04-14") }]
      },
      attendance: {
        create: [
          {
            kind: "formation",
            status: "PRESENT",
            attendedAt: new Date("2026-05-11T15:00:00.000Z"),
            sacredRhythmId: rhythm.id,
            recordedById: catechist.id
          },
          {
            kind: "culte dimanche",
            status: "EXCUSED",
            attendedAt: new Date("2026-05-17T08:00:00.000Z"),
            eventId: event.id,
            recordedById: catechist.id
          }
        ]
      }
    }
  });

  await prisma.gallery.create({
    data: {
      title: "Vie paroissiale",
      description: "Celebrations, formations et moments communautaires.",
      items: {
        create: [
          { title: "Nef de la cathedrale", type: "IMAGE", url: image("photo-1548625361-58a9b86aa83b") },
          { title: "Formation biblique", type: "IMAGE", url: image("photo-1529156069898-49953e39b3ac") }
        ]
      }
    }
  });

  await prisma.testimonial.createMany({
    data: [
      {
        author: "Maman Therese",
        role: "Membre de la paroisse",
        content:
          "La cathedrale est devenue pour notre famille un lieu de foi, d'ecoute et de fraternite."
      },
      {
        author: "Patrick",
        role: "Jeune du mouvement",
        content:
          "Les formations m'aident a mieux comprendre ma foi et a servir avec plus de responsabilite."
      }
    ]
  });

  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: "Seed termine",
      body: "Les donnees initiales de la plateforme paroissiale ont ete creees.",
      type: "SYSTEM",
      link: "/dashboard"
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "seed.complete",
      entity: "Database",
      metadata: {
        announcement: announcement.id,
        catechumen: catechumen.id,
        communities: [choir.id, youth.id]
      }
    }
  });

  console.log("Seed termine");
  console.log("Admin: admin@paroisse.local / Paroisse@2026");
  console.log("Catechiste: catechiste@paroisse.local / Paroisse@2026");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
