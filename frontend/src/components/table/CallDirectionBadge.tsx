import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CallDirection } from "@/features/calls/types";

export function CallDirectionBadge({ direction }: { direction: CallDirection }) {
  const isInbound = direction === "INBOUND";
  return (
    <Badge variant="outline">
      {isInbound ? (
        <ArrowDownLeft aria-hidden="true" />
      ) : (
        <ArrowUpRight aria-hidden="true" />
      )}
      {isInbound ? "Inbound" : "Outbound"}
    </Badge>
  );
}
