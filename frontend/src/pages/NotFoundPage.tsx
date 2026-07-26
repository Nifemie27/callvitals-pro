import { Link } from "react-router-dom";
import { PhoneMissed } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <PhoneMissed
        className="size-8 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h1 className="text-lg font-semibold">This call didn't connect</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        There's no page at this address. Head back to the dashboard to keep
        exploring call activity.
      </p>
      <Button asChild size="sm" className="mt-1">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
