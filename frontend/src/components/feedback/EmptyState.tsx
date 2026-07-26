import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Inbox className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
