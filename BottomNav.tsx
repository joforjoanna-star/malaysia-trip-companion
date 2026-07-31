import { ReactNode } from "react";

interface IconButtonProps {
  onClick: () => void;
  label: string;
  children: ReactNode;
  tone?: "default" | "danger";
}

export function IconButton({
  onClick,
  label,
  children,
  tone = "default",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-2 rounded-full active:scale-90 transition ${
        tone === "danger"
          ? "text-bark hover:bg-clay/10 hover:text-clay"
          : "text-bark hover:bg-cream-tint"
      }`}
    >
      {children}
    </button>
  );
}
