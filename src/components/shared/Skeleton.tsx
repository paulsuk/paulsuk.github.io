export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-sm bg-rule/60 ${className}`} />;
}
