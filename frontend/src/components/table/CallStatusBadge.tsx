import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CallStatus } from "@/features/calls/types";

export function CallStatusBadge({ status }: { status: CallStatus }) {
  if (status === "SUCCESS") {
    return (
      <Badge className={cn("border-transparent bg-good/10 text-good")}>
        <CheckCircle2 aria-hidden="true" />
        Successful
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <XCircle aria-hidden="true" />
      Failed
    </Badge>
  );
}
