import { useState } from "react";
import { useParams } from "react-router-dom";
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

type ViewMode = "manager" | "team";

export default function RecordsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("records");
  const [currentOnly, setCurrentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("manager");

  const { data: managersData, loading: mLoading, error: mError } = useManagers(slug!);
  const { data: recordsData, loading: rLoading, error: rError } = useRecords(slug!);

  const loading = mLoading || rLoading;
  const error = mError || rError;

  const hasFormer = managersData?.managers.some((m) => !m.is_current) ?? false;

  const filteredManagers = currentOnly
    ? managersData?.managers.filter((m) => m.is_current) ?? []
    : managersData?.managers ?? [];

  const currentNames = new Set(
    managersData?.managers.filter((m) => m.is_current).map((m) => m.name) ?? []
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{slug} Records & History</h1>
        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex rounded-md border border-gray-200 text-xs">
            <button
              onClick={() => setViewMode("manager")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                viewMode === "manager"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-l-md`}
            >
              By Manager
            </button>
            <button
              onClick={() => setViewMode("team")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                viewMode === "team"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-r-md`}
            >
              By Team
            </button>
          </div>
          {hasFormer && viewMode === "manager" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={currentOnly}
                onChange={(e) => setCurrentOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              Current only
            </label>
          )}
        </div>
      </div>

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
            <AllTimeRecords
              records={recordsData}
              currentManagerNames={currentOnly ? currentNames : null}
              viewMode={viewMode}
            />
          )}
          {tab === "managers" && managersData && (
            <ManagersTab managers={filteredManagers} viewMode={viewMode} />
          )}
          {tab === "h2h" && managersData && (
            <H2HMatrix managers={filteredManagers} h2h={managersData.h2h} />
          )}
        </>
      )}
    </div>
  );
}
