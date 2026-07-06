export type TopicSlide = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  count: number;
  accent: string;
  image: string;
  icon:
    | "literature"
    | "science"
    | "history"
    | "philosophy"
    | "podcast"
    | "children"
    | "ebook"
    | "audiobook";
};

/** Local cover images — served from /public/slides */
const topicSlideImages: Record<string, string> = {
  ebook: "/slides/ebook.jpg",
  audiobook: "/slides/audiobook.jpg",
  literature: "/slides/literature.jpg",
  science: "/slides/science.svg",
  history: "/slides/history.svg",
  philosophy: "/slides/philosophy.svg",
  podcast: "/slides/podcast.svg",
  children: "/slides/children.jpg",
};

const categoryMeta: Record<
  string,
  Pick<TopicSlide, "subtitle" | "accent" | "icon" | "image"> & { title?: string }
> = {
  literature: {
    subtitle: "شعر، داستان و ادبیات کلاسیک",
    accent: "from-teal-900/50 via-teal-800/25 to-transparent",
    icon: "literature",
    image: topicSlideImages.literature,
  },
  science: {
    subtitle: "علم، دانش و آموزش",
    accent: "from-sky-950/50 via-blue-900/25 to-transparent",
    icon: "science",
    image: topicSlideImages.science,
  },
  history: {
    subtitle: "تاریخ ایران و جهان",
    accent: "from-amber-950/50 via-orange-900/25 to-transparent",
    icon: "history",
    image: topicSlideImages.history,
  },
  philosophy: {
    subtitle: "فلسفه، عرفان و اندیشه",
    accent: "from-violet-950/50 via-purple-900/25 to-transparent",
    icon: "philosophy",
    image: topicSlideImages.philosophy,
  },
  podcast: {
    subtitle: "پادکست و محتوای صوتی",
    accent: "from-rose-950/50 via-red-900/25 to-transparent",
    icon: "podcast",
    image: topicSlideImages.podcast,
  },
  children: {
    subtitle: "مناسب کودک و نوجوان",
    accent: "from-cyan-950/50 via-teal-900/25 to-transparent",
    icon: "children",
    image: topicSlideImages.children,
  },
};

export function buildTopicSlides(
  categories: { name: string; slug: string; description: string | null; count: number }[],
  typeCounts: { ebooks: number; audiobooks: number },
): TopicSlide[] {
  const slides: TopicSlide[] = [
    {
      id: "type-ebook",
      title: "کتاب الکترونیک",
      subtitle: "PDF و متن قابل مطالعه",
      href: "/browse?type=EBOOK",
      count: typeCounts.ebooks,
      accent: "from-teal-950/50 via-teal-900/25 to-transparent",
      icon: "ebook",
      image: topicSlideImages.ebook,
    },
    {
      id: "type-audiobook",
      title: "پادکست و صوتی",
      subtitle: "گوش دادن آنلاین",
      href: "/browse?type=AUDIOBOOK",
      count: typeCounts.audiobooks,
      accent: "from-amber-950/50 via-orange-900/25 to-transparent",
      icon: "audiobook",
      image: topicSlideImages.audiobook,
    },
  ];

  for (const category of categories) {
    const meta = categoryMeta[category.slug];
    if (!meta) continue;

    slides.push({
      id: category.slug,
      title: category.name,
      subtitle: category.description || meta.subtitle,
      href: `/browse?category=${category.slug}`,
      count: category.count,
      accent: meta.accent,
      icon: meta.icon,
      image: meta.image,
    });
  }

  return slides.filter((slide) => slide.count > 0 || slide.id.startsWith("type-"));
}
