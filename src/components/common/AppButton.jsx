import { Link } from "react-router-dom";

function classes(variant) {
  if (variant === "ghost") {
    return "border border-ink/20 bg-transparent text-ink hover:bg-ink hover:text-paper";
  }

  if (variant === "light") {
    return "bg-paper text-ink hover:bg-surface";
  }

  return "bg-ink text-paper hover:bg-navy";
}

export function AppButton({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const baseClass =
    "inline-flex items-center justify-center px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors";
  const styleClass = `${baseClass} ${classes(variant)} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styleClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styleClass} {...props}>
      {children}
    </button>
  );
}
