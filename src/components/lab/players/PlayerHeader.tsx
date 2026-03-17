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
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {team && <span>{team}</span>}
            {positions && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{positions}</span>}
          </div>
        </div>
        {rank != null && value != null && (
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-blue-600">#{rank}</div>
            <div className="text-sm text-gray-500">Value: {value.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
