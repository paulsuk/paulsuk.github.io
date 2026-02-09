import { Link } from "react-router-dom";

const sports = [
  {
    slug: "baseball",
    label: "Baseball",
    icon: "\u26be",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    slug: "basketball",
    label: "Basketball",
    icon: "\ud83c\udfc0",
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center pt-16">
      <h1 className="mb-2 text-3xl font-bold">Paul Suk</h1>
      <p className="mb-12 text-gray-500">Fantasy Sports Analytics</p>

      <div className="flex gap-6">
        {sports.map((s) => (
          <Link
            key={s.slug}
            to={`/${s.slug}`}
            className={`flex flex-col items-center gap-3 rounded-xl border p-8 no-underline transition-colors ${s.color}`}
          >
            <span className="text-5xl">{s.icon}</span>
            <span className="text-lg font-medium text-gray-700">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
