import { cn } from "@/lib/utils";

interface LoaderProps {
  visible?: boolean;
  className?: string;
}

export function Loader({ visible = true, className }: LoaderProps) {
  if (!visible) return null;

  return (
    <div className={cn("flex justify-center py-4", className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
