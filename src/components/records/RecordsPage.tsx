import { useState } from "react";
import { useParams } from "react-router-dom";
import { useManagers } from "../../api/hooks";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import ManagersTab from "./ManagersTab";
import H2HMatrix from "./H2HMatrix";

type Tab = "teams" | "h2h";

const TABS: { key: Tab; label: string }[] = [
  { key: "teams", label: "Teams" },
  { key: "h2h", label: "Head-to-Head" },
];

type ViewMode = "manager" | "franchise";

export default function RecordsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>("teams");
  const [currentOnly, setCurrentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("manager");

  const { data: managersData, loading: mLoading, error: mError } = useManagers(slug!);

  const loading = mLoading;
  const error = mError;

  const hasFormer = managersData?.managers.some((m) => !m.is_current) ?? false;

  const filteredManagers = currentOnly
    ? managersData?.managers.filter((m) => m.is_current) ?? []
    : managersData?.managers ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{slug} Records & History</h1>
        <div className="flex items-center gap-4">
          <div className="toggle-group">
            <button
              onClick={() => setViewMode("manager")}
              className={`toggle-btn ${
                viewMode === "manager"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-l-md`}
            >
              By Manager
            </button>
            <button
              onClick={() => setViewMode("franchise")}
              className={`toggle-btn ${
                viewMode === "franchise"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-r-md`}
            >
              By Franchise
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

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${
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
          {tab === "teams" && managersData && (
            <ManagersTab
              managers={filteredManagers}
              viewMode={viewMode}
              franchiseStats={managersData.franchise_stats}
            />
          )}
          {tab === "h2h" && managersData && (
            <H2HMatrix
              managers={filteredManagers}
              h2h={managersData.h2h}
              viewMode={viewMode}
              franchiseStats={managersData.franchise_stats}
              franchiseH2h={managersData.franchise_h2h}
            />
          )}
        </>
      )}
    </div>
  );
}
