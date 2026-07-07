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
  // ادبیات کلاسیک
  { identifier: "hafez-odrvxoxmkt", title: "دیوان حافظ", creator: "حافظ شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "KulliyatESaadiFarsi", title: "کلیات سعدی", creator: "سعدی شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "GolestanSaadiPersianTextPdf", title: "گلستان سعدی", creator: "سعدی شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "ghazaliyat-e-saadi", title: "غزلیات سعدی", creator: "سعدی شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "shahnameh-the-persian-book-of-kings", title: "شاهنامه — کتاب پادشاهان", creator: "فردوسی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "Sharafnama-HakeemNizamiGanjaviFarsi", title: "شرف‌نامه نظامی گنجوی", creator: "نظامی گنجوی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "20220408_20220408_1747", title: "کلیات سعدی — چاپ جدید", creator: "سعدی شیرازی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "MuseebatNama-AttarNishaburiFarsi", title: "مصیبت‌نامه عطار نیشابوری", creator: "عطار نیشابوری", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "BaKarvanEHulla-AbdulHussainZarrinkoubFarsi", title: "با قافله حل", creator: "عبدالحسین زرین‌کوب", type: "EBOOK", categorySlug: "history" },
  { identifier: "DivanEAliQuliMirzaEtizadUs-SaltanaFakhriQajarFarsi", title: "دیوان علی‌قلی میرزا عتیضادالسلطنه", creator: "علی‌قلی میرزا", type: "EBOOK", categorySlug: "literature" },
  { identifier: "MuntakhabEAshaarEMeerzaArshadHaraviFarsi", title: "منتخب اشعار میرزا ارشد هراتی", creator: "میرزا ارشد هراتی", type: "EBOOK", categorySlug: "literature" },
  { identifier: "Kitobi-Bidon", title: "کتاب بدان", creator: "محمد شریف عبدالعلیم", type: "EBOOK", categorySlug: "science" },
  { identifier: "elementary-persian-grammar.", title: "دستور زبان فارسی مقدماتی", creator: "ناشناس", type: "EBOOK", categorySlug: "science" },
  { identifier: "PersianDocuments", title: "اسناد تاریخی فارسی", creator: "Kondo Nobuaki", type: "EBOOK", categorySlug: "history" },

  // عرفان و فلسفه
  { identifier: "masnavimaulanarumipersian", title: "مثنوی مولانا", creator: "مولانا جلال‌الدین رومی", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "dli.ernet.470831", title: "کتاب مثنوی معنوی", creator: "مولانا رومی", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "in.ernet.dli.2015.522314", title: "مثنوی معنوی — جلد اول", creator: "مولانا رومی", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "falsafeh-persianbooks-1", title: "فلسفه", creator: "محمدرضا قربانی", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "gathas-persianbooks-1", title: "گاتاها", creator: "نیما فرمین", type: "EBOOK", categorySlug: "philosophy" },
  { identifier: "saddar-nasr-persianbooks-1", title: "صدر نصر", creator: "ناشناس", type: "EBOOK", categorySlug: "philosophy" },

  // تاریخ
  { identifier: "Higgins1939PersianWarMaurice", title: "جنگ ایران در زمان موریس", creator: "Martin Higgins", type: "EBOOK", categorySlug: "history" },
  { identifier: "hezbe-kargar-persianbooks-1", title: "حزب کارگر", creator: "احسان طبری", type: "EBOOK", categorySlug: "history" },

  // علمی و معاصر
  { identifier: "sapiens-1-persianbooks-1", title: "انسان خردمند — جلد اول", creator: "یووال نوح هراری", type: "EBOOK", categorySlug: "science" },
  { identifier: "ma-persianbooks-1", title: "ما — توقف‌ناپذیر", creator: "یووال نوح هراری", type: "EBOOK", categorySlug: "science" },
  { identifier: "raz-persianbooks-1", title: "راز", creator: "ف. م. جوان", type: "EBOOK", categorySlug: "literature" },

  // محتوای صوتی و پادکست
  { identifier: "Various_Artist_-_Masnavi_Khani_II", title: "مثنوی‌خوانی — جلد دوم", creator: "هنرمندان مختلف", description: "اجرای صوتی اشعار مثنوی", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "dni.ncaa.SAK-283_2-AC", title: "سمینار زبان و ادبیات فارسی", creator: "Sahitya Akademi", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "mike_worldmentoringacademy_03b", title: "دوره آموزشی فارسی", creator: "Foreign Service Institute", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "MathnaviVol1-2UrduOrCoupletsOfDeepSpiritualMeaningsByJalaluddinRumi", title: "مثنوی — اشعار ۱–۲", creator: "مولانا رومی", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "MathnaviVol3-4UrduOrCoupletsOfDeepSpiritualMeaningsByJalaluddinRumi", title: "مثنوی — اشعار ۳–۴", creator: "مولانا رومی", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "20210117_20210117_2117", title: "گاتاها — سروده‌های مینوی زرتشت", creator: "گردآوری", description: "کتاب صوتی گاتاها", type: "AUDIOBOOK", categorySlug: "podcast" },
  { identifier: "Track121", title: "تصادف شبانه — کتاب صوتی", creator: "پاتریک مودیانو", description: "رمان صوتی ترجمه فارسی", type: "AUDIOBOOK", categorySlug: "podcast" },
];
