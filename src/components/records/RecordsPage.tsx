import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useManagers, useRecords } from "../../api/hooks";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import AllTimeRecords from "./AllTimeRecords";
import ManagersTab from "./ManagersTab";
import H2HMatrix from "./H2HMatrix";

type Tab = "records" | "managers" | "h2h";

const TABS: { key: Tab; label: string }[] = [
  { key: "records", label: "All-Time Records" },
  { key: "managers", label: "Managers" },
  { key: "h2h", label: "Head-to-Head" },
];

export default function RecordsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("records");

  const { data: managersData, loading: mLoading, error: mError } = useManagers(slug!);
  const { data: recordsData, loading: rLoading, error: rError } = useRecords(slug!);

  const loading = mLoading || rLoading;
  const error = mError || rError;

  return (
    <div>
      <Link to={`/${slug}`} className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        &larr; Back to {slug}
      </Link>

      <h1 className="mb-4 text-2xl font-bold capitalize">{slug} Records & History</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && (
        <>
          {tab === "records" && recordsData && (
            <AllTimeRecords records={recordsData} />
          )}
          {tab === "managers" && managersData && (
            <ManagersTab managers={managersData.managers} />
          )}
          {tab === "h2h" && managersData && (
            <H2HMatrix managers={managersData.managers} h2h={managersData.h2h} />
          )}
        </>
      )}
    </div>
  );
}
