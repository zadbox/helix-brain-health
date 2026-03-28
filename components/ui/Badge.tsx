import { cn } from "@/lib/utils";

type BadgeVariant = "haute" | "moyenne" | "faible" | "urgent" | "warning" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  haute: "bg-red-500 text-white",
  moyenne: "bg-orange-500 text-white",
  faible: "bg-yellow-500 text-white",
  urgent: "bg-red-600 text-white animate-pulse",
  warning: "bg-orange-500 text-white",
  info: "bg-blue-500 text-white",
  default: "bg-gray-200 text-gray-800",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
