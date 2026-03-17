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
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Transaction History</h3>
        <p className="text-label text-sm">No transactions recorded.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Transaction History</h3>
      <div className="space-y-1">
        {records.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-10 text-gray-400">{t.season}</span>
            {t.week && <span className="text-gray-400 text-xs">Wk {t.week}</span>}
            <span className={`text-xs font-medium ${
              t.transaction_type === "add" ? "text-green-600"
              : t.transaction_type === "drop" ? "text-red-500"
              : "text-blue-600"
            }`}>
              {TYPE_LABEL[t.transaction_type] ?? t.transaction_type}
            </span>
            {t.team_name && <span className="text-gray-500">{t.team_name}</span>}
            {t.league_name && <span className="text-gray-400 text-xs">({t.league_name})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
