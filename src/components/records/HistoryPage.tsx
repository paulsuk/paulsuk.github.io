import { useState } from "react";
import { useManagers } from "../../api/hooks";
import { useSport } from "../../context/SportContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import ManagersTab from "./ManagersTab";
import H2HMatrix from "./H2HMatrix";
import ToggleGroup from "../shared/ToggleGroup";

type Tab = "teams" | "h2h";

const TABS: { key: Tab; label: string }[] = [
  { key: "teams", label: "Teams" },
  { key: "h2h", label: "Head-to-Head" },
];

type ViewMode = "manager" | "franchise";

export default function HistoryPage() {
  const { slug, scoringMode, setScoringMode } = useSport();
  const [tab, setTab] = useState<Tab>("teams");
  const [currentOnly, setCurrentOnly] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("franchise");

  const { data: managersData, loading: mLoading, error: mError } = useManagers(slug);

  const loading = mLoading;
  const error = mError;

  const hasFormer = managersData?.managers.some((m) => !m.is_current) ?? false;

  const filteredManagers = currentOnly
    ? managersData?.managers.filter((m) => m.is_current) ?? []
    : managersData?.managers ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Records & History</h2>
        <div className="flex items-center gap-4">
          {tab === "teams" && (
            <ToggleGroup value={scoringMode} onChange={setScoringMode}
              options={[
                { value: "category", label: "Categories" },
                { value: "matchup", label: "Matchups" },
              ]} />
          )}
          <ToggleGroup value={viewMode} onChange={setViewMode}
            options={[
              { value: "manager", label: "By Manager" },
              { value: "franchise", label: "By Franchise" },
            ]} />
          {viewMode === "manager" && (
            hasFormer ? (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={!currentOnly}
                  onChange={(e) => setCurrentOnly(!e.target.checked)}
                  className="rounded border-rule"
                />
                Show previous managers
              </label>
            ) : (
              <p className="text-sm italic text-ink-faint">Everyone's still here. No alumni yet.</p>
            )
          )}
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? "tab-btn-active" : ""}`}
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
