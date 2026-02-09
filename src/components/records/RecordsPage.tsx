import { useParams } from "react-router-dom";

export default function RecordsPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold capitalize">{slug} Records & History</h1>
      <p className="text-gray-500">Records page coming soon.</p>
    </div>
  );
}
