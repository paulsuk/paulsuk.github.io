import type { TransactionRecord } from "../../../api/types";

const TYPE_LABEL: Record<string, string> = {
  add: "Added",
  drop: "Dropped",
  trade: "Traded",
};

export default function TransactionHistory({ records }: { records: TransactionRecord[] }) {
  if (!records.length) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-ink-soft mb-2">Transaction History</h3>
        <p className="text-label text-sm">No transactions recorded.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">Transaction History</h3>
      <div className="table-dense space-y-1">
        {records.map((t, i) => (
          <div key={i} className="flex items-center gap-3 td-dense text-ink-soft">
            <span className="w-10 text-ink-faint cell-num">{t.season}</span>
            {t.week && <span className="text-ink-faint text-xs">Wk {t.week}</span>}
            <span className={`text-xs font-medium ${
              t.transaction_type === "add" ? "text-win"
              : t.transaction_type === "drop" ? "text-loss"
              : "text-tool"
            }`}>
              {TYPE_LABEL[t.transaction_type] ?? t.transaction_type}
            </span>
            {t.team_name && <span className="text-ink-soft">{t.team_name}</span>}
            {t.league_name && <span className="text-ink-faint text-xs">({t.league_name})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
