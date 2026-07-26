import { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHUNK_RELOAD_FLAG } from "@/constants/config";

// Matches Chrome ("Failed to fetch dynamically imported module"), Firefox
// ("Importing a module script failed"), Safari ("Load failed" during an
// import), and the Vercel-rewrite-era MIME-type mismatch - every phrasing
// browsers use for the same underlying failure: a lazy route's chunk didn't
// load. window.addEventListener('vite:preloadError', ...) in main.tsx is the
// primary defense; this is the fallback for whatever slips past it.
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|importing a module script failed|not a valid JavaScript MIME type|failed to fetch|load failed|loading chunk/i.test(
    message,
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [isReloading, setIsReloading] = useState(false);
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    if (chunkError && !sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
      setIsReloading(true);
      window.location.reload();
    }
  }, [chunkError]);

  if (isReloading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-center">
        <RefreshCw
          className="size-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          Updating to the latest version…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {chunkError
          ? "This page couldn't load the latest version of the app. Reloading should fix it."
          : "An unexpected error occurred while rendering this page."}
      </p>
      <div className="mt-1 flex gap-2">
        <Button size="sm" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
