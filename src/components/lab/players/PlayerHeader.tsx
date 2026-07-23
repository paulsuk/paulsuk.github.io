interface Props {
  name: string;
  team: string | null;
  positions: string | null;
  rank: number | null;
  value: number | null;
}

export default function PlayerHeader({ name, team, positions, rank, value }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-ink-soft">
            {team && <span>{team}</span>}
            {positions && <span className="text-xs bg-paper px-2 py-0.5 rounded">{positions}</span>}
          </div>
        </div>
        {rank != null && value != null && (
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-tool">#{rank}</div>
            <div className="text-sm text-ink-soft">Value: {value.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
