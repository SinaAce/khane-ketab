import Image from "next/image";
import Link from "next/link";

const options = [
  {
    id: "a",
    title: "طرح A — خانه + کتاب",
    desc: "کتاب باز با سقف خانه، مینیمال و مرتبط با «خانه کتاب»",
    src: "/logos/option-a.png",
  },
  {
    id: "b",
    title: "طرح B — نشان دایره‌ای",
    desc: "کتاب و هلال در دایره، حس ایرانی-کلاسیک",
    src: "/logos/option-b.png",
  },
  {
    id: "c",
    title: "طرح C — کتاب با نشانک",
    desc: "کتاب باز با رibbon طلایی، ساده و خوانا",
    src: "/logos/option-c.png",
  },
  {
    id: "d",
    title: "طرح D — خانه کتاب",
    desc: "خانه‌ای که درِ آن کتاب است، مفهومی و مدرن",
    src: "/logos/option-d.png",
  },
];

export default function LogoPreviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-teal-brand">انتخاب لوگو</h1>
        <p className="mt-2 text-sm text-muted">
          یکی از طرح‌ها را انتخاب کنید (A، B، C یا D) تا در navbar، favicon و بقیه جاها قرار بگیرد.
        </p>
        <Link href="/" className="mt-3 inline-block text-sm text-teal-brand hover:underline">
          بازگشت به خانه
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {options.map((option) => (
          <div key={option.id} className="surface-panel overflow-hidden rounded-2xl">
            <div className="border-b border-border-persian px-4 py-3">
              <p className="font-semibold text-foreground">{option.title}</p>
              <p className="mt-1 text-xs text-muted">{option.desc}</p>
            </div>

            <div className="grid grid-cols-2">
              <div className="flex flex-col items-center gap-2 border-l border-border-persian bg-white p-6">
                <span className="text-xs text-stone-500">پس‌زمینه روشن</span>
                <Image src={option.src} alt={option.title} width={80} height={80} />
              </div>
              <div className="flex flex-col items-center gap-2 bg-[#1a1614] p-6">
                <span className="text-xs text-stone-400">پس‌زمینه تیره</span>
                <Image src={option.src} alt={option.title} width={80} height={80} />
              </div>
            </div>

            <div className="border-t border-border-persian bg-surface-muted px-4 py-3 text-center text-sm font-medium text-teal-brand">
              طرح {option.id.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
