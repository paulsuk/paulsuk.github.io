import { useState } from "react";
import type { TransactionCount, Trade } from "../../api/types";
import Card from "../shared/Card";
import TradeCard from "./TradeCard";
import { formatSeason } from "../../utils/records-helpers";

interface FranchiseTransactionsProps {
  counts: TransactionCount[];
  trades: Trade[];
  slug: string;
}

export default function FranchiseTransactions({ counts, trades, slug }: FranchiseTransactionsProps) {
  const [tradesExpanded, setTradesExpanded] = useState(false);

  return (
    <Card title="Transaction Activity">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="pb-2 pr-4">Season</th>
              <th className="pb-2 pr-4">Adds</th>
              <th className="pb-2 pr-4">Drops</th>
              <th className="pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((c) => (
              <tr key={c.season} className="border-b border-gray-50">
                <td className="py-1.5 pr-4 font-medium text-gray-400">{formatSeason(c.season, slug)}</td>
                <td className="py-1.5 pr-4 tabular-nums">{c.adds}</td>
                <td className="py-1.5 pr-4 tabular-nums">{c.drops}</td>
                <td className="py-1.5 tabular-nums font-medium">{c.adds + c.drops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trades.length > 0 && (
        <div className="divider">
          <button
            onClick={() => setTradesExpanded(!tradesExpanded)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="section-label">Trade History</div>
            <span className="text-xs text-gray-400">
              {trades.length} trade{trades.length !== 1 ? "s" : ""} {tradesExpanded ? "▲" : "▼"}
            </span>
          </button>
          {tradesExpanded && (
            <div className="space-y-3 mt-2">
              {trades.map((trade: Trade) => (
                <TradeCard key={trade.timestamp} trade={trade} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
