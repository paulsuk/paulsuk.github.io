import { Navigate, useLocation, useParams } from "react-router-dom";
import { leagueBySportCode } from "../../utils/league-config";

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
