import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className = "h-4 w-4", label }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "status" : undefined}
    />
  );
}
