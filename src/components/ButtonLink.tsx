import Link from "next/link";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-ink",
  secondary: "border border-ink/40 text-ink hover:border-ink hover:bg-ink/10",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  download = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  download?: boolean;
  external?: boolean;
}) {
  const className = `inline-flex items-center justify-center rounded-sm px-5 py-3 font-display text-lg font-bold uppercase tracking-wide transition-colors ${VARIANTS[variant]}`;
  if (download) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
