import { useParams } from "react-router-dom";
import { usePlayer } from "../../api/hooks";
import { useSport } from "../../context/SportContext";
import Breadcrumbs from "../layout/Breadcrumbs";
import { LAB_AUTH_KEY } from "../layout/PasswordGate";
import ErrorBanner from "../shared/ErrorBanner";
import Skeleton from "../shared/Skeleton";
import PlayerCard from "../shared/PlayerCard";

export default function LeaguePlayerPage() {
  const { uid } = useParams<{ uid: string }>();
  const { slug } = useSport();
  const { data: player, loading, error } = usePlayer(uid ?? null);

  const labAuthed =
    typeof localStorage !== "undefined" && localStorage.getItem(LAB_AUTH_KEY) === "true";
  const labHref =
    labAuthed && player?.yahoo_player_ids?.[0]
      ? `/lab/${slug}/players/${player.yahoo_player_ids[0]}`
      : null;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Players" }, { label: player?.name ?? "…" }]} />
      {error && <ErrorBanner message={error} />}
      {loading && <Skeleton className="h-40 w-full" />}
      {player && <PlayerCard player={player} labHref={labHref} />}
    </div>
  );
}
