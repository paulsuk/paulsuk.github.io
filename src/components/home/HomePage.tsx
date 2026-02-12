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

      <div className="mt-16 max-w-md text-center">
        <p className="text-sm text-gray-500">
          Built by Paul Suk. Fantasy league recaps, power rankings, records, and
          head-to-head history — powered by Yahoo Fantasy data.
        </p>
        <div className="mt-3 flex justify-center gap-4">
          <a href="https://linkedin.com/in/paulsuk1" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600">LinkedIn</a>
          <a href="https://github.com/paulsuk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600">GitHub</a>
          <a href="https://instagram.com/paul.suk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600">Instagram</a>
        </div>
      </div>
    </div>
  );
}
