import { Navigate, useParams } from "react-router-dom";

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
