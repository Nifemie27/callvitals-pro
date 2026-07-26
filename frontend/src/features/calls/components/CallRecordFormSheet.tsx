import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  callRecordSchema,
  type CallRecordFormInput,
  type CallRecordFormValues,
} from "@/features/calls/schemas";
import type { CallRecord, CallRecordInput } from "@/features/calls/types";

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function defaultValues(record: CallRecord | null): CallRecordFormInput {
  if (!record) {
    const durationSeconds = 60;
    const start = new Date();
    const end = new Date(start.getTime() + durationSeconds * 1000);
    return {
      callerName: "",
      callerNumber: "",
      receiverNumber: "",
      city: "",
      direction: "OUTBOUND",
      status: "SUCCESS",
      durationSeconds,
      cost: 0,
      startTime: toDatetimeLocal(start.toISOString()),
      endTime: toDatetimeLocal(end.toISOString()),
    };
  }
  return {
    callerName: record.callerName,
    callerNumber: record.callerNumber,
    receiverNumber: record.receiverNumber,
    city: record.city,
    direction: record.direction,
    status: record.status,
    durationSeconds: record.durationSeconds,
    cost: record.cost,
    startTime: toDatetimeLocal(record.startTime),
    endTime: toDatetimeLocal(record.endTime),
  };
}

interface CallRecordFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CallRecord | null;
  onSubmit: (values: CallRecordInput) => Promise<unknown>;
  isSubmitting: boolean;
}

export function CallRecordFormSheet({
  open,
  onOpenChange,
  record,
  onSubmit,
  isSubmitting,
}: CallRecordFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CallRecordFormInput, unknown, CallRecordFormValues>({
    resolver: zodResolver(callRecordSchema),
    defaultValues: defaultValues(record),
  });

  useEffect(() => {
    if (open) reset(defaultValues(record));
  }, [open, record, reset]);

  async function handleFormSubmit(values: CallRecordFormValues) {
    await onSubmit({
      ...values,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{record ? "Edit call record" : "New call record"}</SheetTitle>
          <SheetDescription>
            {record ? "Update the details for this call record." : "Manually add a call record."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="callerName">Caller name</Label>
              <Input id="callerName" {...register("callerName")} />
              {errors.callerName && (
                <p className="text-xs text-destructive">{errors.callerName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="callerNumber">Caller number</Label>
              <Input id="callerNumber" {...register("callerNumber")} />
              {errors.callerNumber && (
                <p className="text-xs text-destructive">{errors.callerNumber.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receiverNumber">Receiver number</Label>
              <Input id="receiverNumber" {...register("receiverNumber")} />
              {errors.receiverNumber && (
                <p className="text-xs text-destructive">{errors.receiverNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={watch("direction")}
                onValueChange={(value) => setValue("direction", value as "INBOUND" | "OUTBOUND")}
              >
                <SelectTrigger id="direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INBOUND">Inbound</SelectItem>
                  <SelectItem value="OUTBOUND">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as "SUCCESS" | "FAILED")}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESS">Successful</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="durationSeconds">Duration (seconds)</Label>
              <Input
                id="durationSeconds"
                type="number"
                min={0}
                {...register("durationSeconds")}
              />
              {errors.durationSeconds && (
                <p className="text-xs text-destructive">{errors.durationSeconds.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input id="cost" type="number" min={0} step="0.01" {...register("cost")} />
              {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" type="datetime-local" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" type="datetime-local" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t p-0 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : record ? "Save changes" : "Create record"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
