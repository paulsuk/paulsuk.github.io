import { useEffect } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { postApi } from "../../api/client";
import type { PlayerResolveResponse } from "../../api/types";
import { leagueBySportCode } from "../../utils/league-config";
import LoadingSpinner from "./LoadingSpinner";

export function LegacyLabRedirect() {
  const location = useLocation();
  // /lab/mlb/rankings → /lab/baseball/rankings
  const [, , code, ...rest] = location.pathname.split("/");
  const slug = leagueBySportCode(code)?.slug ?? "baseball";
  return <Navigate to={`/lab/${slug}/${rest.join("/")}${location.search}`} replace />;
}

export function LegacyArticleRedirect() {
  const { slug, articleId } = useParams();
  return <Navigate to={`/${slug}/articles/${articleId}`} replace />;
}

export function LegacyFranchiseRedirect() {
  const { slug, franchiseId } = useParams();
  return <Navigate to={`/${slug}/history/franchise/${franchiseId}`} replace />;
}

export function LegacyRecordsRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/${slug}/history`} replace />;
}

/** /lab/:slug/players/<numeric yahoo id> -> resolve to uid and replace the URL.
 * Unresolvable ids land on rankings (spec §3). */
export function LabNumericPlayerRedirect({
  slug,
  sportCode,
  numericId,
}: {
  slug: string;
  sportCode: string;
  numericId: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    postApi<PlayerResolveResponse>("/api/players/resolve", {
      sport: sportCode,
      ids: [{ type: "yahoo", value: numericId }],
    })
      .then((r) => {
        if (cancelled) return;
        const chip = r.players[numericId];
        navigate(
          chip
            ? `/lab/${slug}/players/${encodeURIComponent(chip.uid)}${location.search}`
            : `/lab/${slug}/rankings`,
          { replace: true },
        );
      })
      .catch(() => {
        if (!cancelled) navigate(`/lab/${slug}/rankings`, { replace: true });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sportCode, numericId]);

  return <LoadingSpinner />;
}
