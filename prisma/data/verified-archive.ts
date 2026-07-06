export type VerifiedArchiveItem = {
  identifier: string;
  title: string;
  creator: string;
  description?: string;
  type: "EBOOK" | "AUDIOBOOK";
  categorySlug: string;
};

/** Verified Internet Archive identifiers — import works offline (no API needed) */
export const VERIFIED_ARCHIVE: VerifiedArchiveItem[] = [
  { identifier: "Sharafnama-HakeemNizamiGanjaviFarsi", title: "شرف‌نامه نظامی گنجوی", creator: "نظامی گنجوی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "20220408_20220408_1747", title: "کلیات سعدی", creator: "سعدی شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "masnavimaulanarumipersian", title: "مثنوی مولانا", creator: "مولانا جلالuddin رumi", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "dli.ernet.470831", title: "کتاب مثنوی معنوی", creator: "مولana رumi", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "in.ernet.dli.2015.522314", title: "مثنوی معنوی — جلد اول", creator: "مولana رumi", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "Higgins1939PersianWarMaurice", title: "جنگ ایران در زمان موریس", creator: "Martin Higgins", type: "EBOOK", categorySlug: "history" },
  { identifier: "sapiens-1-persianbooks-1", title: "انسان خردمند — جلد اول", creator: "یوval نوح هرari", type: "EBOOK", categorySlug: "science" },
  { identifier: "ma-persianbooks-1", title: "ما — توقف‌ناپذیر", creator: "یوval نوح هرari", type: "EBOOK", categorySlug: "science" },
  { identifier: "raz-persianbooks-1", title: "راز", creator: "ف. م. جوان", type: "EBOOK", categorySlug: "literature" },
  { identifier: "falsafeh-persianbooks-1", title: "فلسفه", creator: "محمدreza قربانی", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "gathas-persianbooks-1", title: "گathاها", creator: "نیما فرمین", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "saddar-nasr-persianbooks-1", title: "صeddar نصر", creator: "ناشناس", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "hezbe-kargar-persianbooks-1", title: "حزب کارگر", creator: "احsan طبری", type: "EBOOK", categorySlug: "history" },
  { identifier: "Kitobi-Bidon", title: "کتاب بدان فارسی", creator: "محمد شریف عبدالعلیم", type: "EBOOK", categorySlug: "science" },
  { identifier: "elementary-persian-grammar.", title: "دستور زبان فارسی مقدماتی", creator: "ناشناس", type: "EBOOK", categorySlug: "science" },
  { identifier: "Various_Artist_-_Masnavi_Khani_II", title: "مثنوی‌خوانی — جلد دوم", creator: "هنرمندان مختلف", description: "اجرای صوتی اشعار مثنوی", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "dni.ncaa.SAK-283_2-AC", title: "سمینار زبان و ادبیات فارسی", creator: "سahitya Akademi", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "mike_worldmentoringacademy_03b", title: "دوره آموزشی فارسی", creator: "Foreign Service Institute", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "MathnaviVol1-2UrduOrCoupletsOfDeepSpiritualMeaningsByJalaluddinRumi", title: "مثنوی — اشعار ۱–۲", creator: "مولana رumi", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "MathnaviVol3-4UrduOrCoupletsOfDeepSpiritualMeaningsByJalaluddinRumi", title: "مثنوی — اشعار ۳–۴", creator: "مولana رumi", type: "AUDIOBOOK", categorySlug: "podcast" },
];
