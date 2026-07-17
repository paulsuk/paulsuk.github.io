interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-sm border border-loss/30 bg-loss/5 px-4 py-3 text-sm text-loss">
      {message}
    </div>
  );
}
