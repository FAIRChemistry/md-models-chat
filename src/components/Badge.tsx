import { cn } from "@/lib/utils";

interface BadgeProps {
  fits: boolean;
  className?: string;
}

export default function FitBadge({ fits, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "my-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        fits
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        className
      )}
    >
      {fits ? "Fits schema" : "Does not fit schema"}
    </span>
  );
}

// Example usage
export function BadgeDemo() {
  return (
    <div className="flex gap-4 p-4">
      <FitBadge fits={true} />
      <FitBadge fits={false} />
    </div>
  );
}
