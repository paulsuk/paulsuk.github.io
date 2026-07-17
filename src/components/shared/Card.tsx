interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`card-editorial ${className}`}>
      {title && <h3 className="eyebrow section-rule mb-3 pt-1">{title}</h3>}
      {children}
    </div>
  );
}
