import {
  AvailabilityStatus,
  PrismaClient,
  TherapistStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

type SpecializationSeed = {
  slug: string;
  nameAr: string;
  nameEn: string;
};

type TherapistSeed = {
  fullName: string;
  email: string;
  slugBase: string;
  status: TherapistStatus;
  isVerified: boolean;
  sessionPriceSar: string;
  rating: string;
  reviewCount: number;
  yearsOfExperience: number;
  profileImageUrl: string | null;
  headlineAr: string;
  bioAr: string;
  credentialsAr: string;
  languages: string[];
  sessionModes: string[];
  specializationSlugs: string[];
  slotGroups: Array<{
    dayOffset: number;
    hours: number[];
    status?: AvailabilityStatus;
  }>;
};

const specializationSeeds: SpecializationSeed[] = [
  { slug: "anxiety", nameAr: "القلق", nameEn: "Anxiety" },
  { slug: "depression", nameAr: "الاكتئاب", nameEn: "Depression" },
  { slug: "family-therapy", nameAr: "العلاج الأسري", nameEn: "Family Therapy" },
  { slug: "marriage-counseling", nameAr: "الإرشاد الزواجي", nameEn: "Marriage Counseling" },
  { slug: "stress-burnout", nameAr: "الضغط والاحتراق", nameEn: "Stress & Burnout" },
  { slug: "trauma", nameAr: "الصدمات النفسية", nameEn: "Trauma" },
];

const therapistSeeds: TherapistSeed[] = [
  {
    fullName: "نورة الحربي",
    email: "noura.alharbi@healify.test",
    slugBase: "noura-alharbi",
    status: TherapistStatus.ACTIVE,
    isVerified: true,
    sessionPriceSar: "320.00",
    rating: "4.90",
    reviewCount: 84,
    yearsOfExperience: 12,
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    headlineAr: "أخصائية علاج معرفي سلوكي",
    bioAr: "تدعم البالغين في التعامل مع القلق، الضغوط، وتنظيم المشاعر من خلال جلسات عملية وواضحة.",
    credentialsAr: "ماجستير علم نفس إكلينيكي، ترخيص مهني ساري",
    languages: ["العربية", "الإنجليزية"],
    sessionModes: ["video", "audio"],
    specializationSlugs: ["anxiety", "stress-burnout"],
    slotGroups: [
      { dayOffset: 1, hours: [10, 12, 16] },
      { dayOffset: 3, hours: [11, 15] },
    ],
  },
  {
    fullName: "ريم القحطاني",
    email: "reem.alqahtani@healify.test",
    slugBase: "reem-alqahtani",
    status: TherapistStatus.ACTIVE,
    isVerified: true,
    sessionPriceSar: "380.00",
    rating: "4.80",
    reviewCount: 67,
    yearsOfExperience: 10,
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    headlineAr: "أخصائية علاقات أسرية وزوجية",
    bioAr: "تعمل مع الأزواج والعائلات على تحسين التواصل، إدارة الخلافات، وبناء بيئة داعمة ومستقرة.",
    credentialsAr: "دبلوم إرشاد أسري وزواجي، خبرة إكلينيكية في العيادات الخاصة",
    languages: ["العربية"],
    sessionModes: ["video"],
    specializationSlugs: ["family-therapy", "marriage-counseling"],
    slotGroups: [
      { dayOffset: 2, hours: [14, 18] },
      { dayOffset: 4, hours: [13, 17] },
    ],
  },
  {
    fullName: "سارة المطيري",
    email: "sara.almutairi@healify.test",
    slugBase: "sara-almutairi",
    status: TherapistStatus.ACTIVE,
    isVerified: false,
    sessionPriceSar: "250.00",
    rating: "4.40",
    reviewCount: 29,
    yearsOfExperience: 6,
    profileImageUrl: null,
    headlineAr: "معالجة تدعم التوازن النفسي اليومي",
    bioAr: "تركز على تقديم أدوات عملية لإدارة الضغط وتحسين العادات النفسية اليومية.",
    credentialsAr: "بكالوريوس علم نفس، دورات معتمدة في الدعم النفسي",
    languages: ["العربية", "الإنجليزية"],
    sessionModes: ["video", "audio"],
    specializationSlugs: ["stress-burnout", "anxiety"],
    slotGroups: [
      { dayOffset: 1, hours: [9, 17] },
      { dayOffset: 5, hours: [11] },
    ],
  },
  {
    fullName: "هدى الشمري",
    email: "huda.alshammari@healify.test",
    slugBase: "huda-alshammari",
    status: TherapistStatus.ACTIVE,
    isVerified: true,
    sessionPriceSar: "410.00",
    rating: "4.95",
    reviewCount: 102,
    yearsOfExperience: 15,
    profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    headlineAr: "استشارية علاج الصدمات النفسية",
    bioAr: "تقدم دعماً متخصصاً للحالات المرتبطة بالتجارب الصادمة والتوتر الممتد ضمن إطار علاجي آمن ومتدرج.",
    credentialsAr: "دكتوراه في علم النفس، خبرة في مراكز الصحة النفسية",
    languages: ["العربية"],
    sessionModes: ["video"],
    specializationSlugs: ["trauma", "depression"],
    slotGroups: [
      { dayOffset: 6, hours: [10, 12] },
      { dayOffset: 8, hours: [14] },
    ],
  },
  {
    fullName: "لينا العتيبي",
    email: "lina.alotaibi@healify.test",
    slugBase: "lina-alotaibi",
    status: TherapistStatus.ACTIVE,
    isVerified: false,
    sessionPriceSar: "220.00",
    rating: "4.20",
    reviewCount: 16,
    yearsOfExperience: 4,
    profileImageUrl: null,
    headlineAr: "أخصائية دعم نفسي للنساء",
    bioAr: "تساعد في التعامل مع القلق المرتبط بضغوط الحياة اليومية والانتقالات الشخصية.",
    credentialsAr: "ترخيص ممارس، دورات علاج معرفي سلوكي",
    languages: ["العربية"],
    sessionModes: ["audio"],
    specializationSlugs: ["anxiety"],
    slotGroups: [
      { dayOffset: 2, hours: [9, 10, 11] },
    ],
  },
  {
    fullName: "مشاعل العنزي",
    email: "mashael.alanazi@healify.test",
    slugBase: "mashael-alanazi",
    status: TherapistStatus.ACTIVE,
    isVerified: true,
    sessionPriceSar: "300.00",
    rating: "4.70",
    reviewCount: 53,
    yearsOfExperience: 8,
    profileImageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    headlineAr: "أخصائية اكتئاب وتكيف نفسي",
    bioAr: "تعمل مع المستفيدين على تحسين المزاج، إعادة بناء الروتين، وتطوير استراتيجيات التكيف.",
    credentialsAr: "ماجستير إرشاد نفسي، ممارسة في القطاع الصحي الخاص",
    languages: ["العربية", "الإنجليزية"],
    sessionModes: ["video", "audio"],
    specializationSlugs: ["depression", "stress-burnout"],
    slotGroups: [
      { dayOffset: 0, hours: [18] },
      { dayOffset: 4, hours: [10, 16] },
    ],
  },
  {
    fullName: "أريج الزهراني",
    email: "areej.alzahrani@healify.test",
    slugBase: "areej-alzahrani",
    status: TherapistStatus.ONBOARDING,
    isVerified: false,
    sessionPriceSar: "260.00",
    rating: "4.10",
    reviewCount: 9,
    yearsOfExperience: 3,
    profileImageUrl: null,
    headlineAr: "أخصائية ناشئة في الإرشاد الأسري",
    bioAr: "تهتم بتقديم جلسات توعوية وعملية لتحسين بيئة التواصل الأسري.",
    credentialsAr: "بكالوريوس علم نفس، تدريب سريري تحت الإشراف",
    languages: ["العربية"],
    sessionModes: ["video"],
    specializationSlugs: ["family-therapy"],
    slotGroups: [
      { dayOffset: 7, hours: [15] },
    ],
  },
  {
    fullName: "بيان الشهري",
    email: "bayan.alshahri@healify.test",
    slugBase: "bayan-alshahri",
    status: TherapistStatus.ACTIVE,
    isVerified: true,
    sessionPriceSar: "450.00",
    rating: "4.88",
    reviewCount: 75,
    yearsOfExperience: 14,
    profileImageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    headlineAr: "استشارية جلسات زوجية مكثفة",
    bioAr: "تقدم جلسات متخصصة للأزواج مع تركيز على الإصغاء الفعال، الحدود الصحية، وحل النزاعات.",
    credentialsAr: "زمالة علاج أسري وزواجي، خبرة طويلة في الإرشاد",
    languages: ["العربية", "الإنجليزية"],
    sessionModes: ["video"],
    specializationSlugs: ["marriage-counseling", "family-therapy"],
    slotGroups: [
      { dayOffset: 3, hours: [18] },
      { dayOffset: 9, hours: [12, 17] },
    ],
  },
  {
    fullName: "جود السبيعي",
    email: "jood.alsubaie@healify.test",
    slugBase: "jood-alsubaie",
    status: TherapistStatus.ACTIVE,
    isVerified: false,
    sessionPriceSar: "210.00",
    rating: "4.35",
    reviewCount: 21,
    yearsOfExperience: 5,
    profileImageUrl: null,
    headlineAr: "جلسات عملية لإدارة القلق",
    bioAr: "تعمل على تبسيط الخطط العلاجية ومساعدة المستفيدين على تطبيقها في الحياة اليومية.",
    credentialsAr: "ممارس صحي مرخص، تدريب في العلاج القصير",
    languages: ["العربية"],
    sessionModes: ["audio", "video"],
    specializationSlugs: ["anxiety", "depression"],
    slotGroups: [
      { dayOffset: 1, hours: [13, 14] },
    ],
  },
  {
    fullName: "روان الدوسري",
    email: "rawan.aldosari@healify.test",
    slugBase: "rawan-aldosari",
    status: TherapistStatus.INACTIVE,
    isVerified: true,
    sessionPriceSar: "340.00",
    rating: "4.65",
    reviewCount: 41,
    yearsOfExperience: 9,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    headlineAr: "أخصائية علاج معرفي سلوكي",
    bioAr: "تساعد على بناء استراتيجيات عملية للتعامل مع الأفكار المقلقة واستعادة الإيقاع اليومي.",
    credentialsAr: "ماجستير إكلينيكي، خبرة في الجلسات الافتراضية",
    languages: ["العربية", "الإنجليزية"],
    sessionModes: ["video"],
    specializationSlugs: ["anxiety", "stress-burnout"],
    slotGroups: [
      { dayOffset: 10, hours: [10], status: AvailabilityStatus.BLOCKED },
    ],
  },
];

function toUtcDateFromRiyadh(dayOffset: number, hour: number, minute = 0) {
  const base = new Date();
  const utcYear = base.getUTCFullYear();
  const utcMonth = base.getUTCMonth();
  const utcDate = base.getUTCDate() + dayOffset;

  // Riyadh is UTC+3 year-round, so local Riyadh slot times are shifted back by 3 hours.
  return new Date(Date.UTC(utcYear, utcMonth, utcDate, hour - 3, minute, 0, 0));
}

async function resetDatabase() {
  await prisma.therapistAvailability.deleteMany();
  await prisma.therapistProfile.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.user.deleteMany();
  await prisma.specialization.deleteMany();
}

async function seedSpecializations() {
  for (const specialization of specializationSeeds) {
    await prisma.specialization.upsert({
      where: { slug: specialization.slug },
      update: {
        nameAr: specialization.nameAr,
        nameEn: specialization.nameEn,
      },
      create: specialization,
    });
  }
}

async function buildUniqueSlug(slugBase: string) {
  let slug = slugBase;
  let counter = 2;

  while (await prisma.therapist.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function seedTherapists() {
  for (const therapist of therapistSeeds) {
    const slug = await buildUniqueSlug(therapist.slugBase);
    const user = await prisma.user.create({
      data: {
        fullName: therapist.fullName,
        email: therapist.email,
        role: UserRole.THERAPIST,
      },
    });

    await prisma.therapist.create({
      data: {
        userId: user.id,
        slug,
        status: therapist.status,
        isVerified: therapist.isVerified,
        sessionPriceSar: therapist.sessionPriceSar,
        rating: therapist.rating,
        reviewCount: therapist.reviewCount,
        yearsOfExperience: therapist.yearsOfExperience,
        profileImageUrl: therapist.profileImageUrl,
        specializations: {
          connect: therapist.specializationSlugs.map((specializationSlug) => ({
            slug: specializationSlug,
          })),
        },
        profile: {
          create: {
            headlineAr: therapist.headlineAr,
            bioAr: therapist.bioAr,
            credentialsAr: therapist.credentialsAr,
            languages: therapist.languages,
            sessionModes: therapist.sessionModes,
          },
        },
        availabilities: {
          create: therapist.slotGroups.flatMap((slotGroup) =>
            slotGroup.hours.map((hour) => {
              const startsAtUtc = toUtcDateFromRiyadh(slotGroup.dayOffset, hour);
              const endsAtUtc = new Date(startsAtUtc.getTime() + 50 * 60 * 1000);

              return {
                startsAtUtc,
                endsAtUtc,
                timezone: "Asia/Riyadh",
                status: slotGroup.status ?? AvailabilityStatus.AVAILABLE,
              };
            }),
          ),
        },
      },
    });
  }
}

async function main() {
  await resetDatabase();
  await seedSpecializations();
  await seedTherapists();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
