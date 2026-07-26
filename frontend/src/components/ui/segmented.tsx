import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Segmented({
  options,
  value,
  onChange,
  className,
}: SegmentedProps) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-lg border bg-secondary p-1",
        className,
      )}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 px-2.5 text-xs text-muted-foreground",
            value === option.value && "bg-card text-foreground shadow-sm",
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
