import { z } from "zod";

export const callRecordSchema = z
  .object({
    callerName: z.string().trim().min(1, "Required").max(200),
    callerNumber: z.string().trim().min(1, "Required").max(30),
    receiverNumber: z.string().trim().min(1, "Required").max(30),
    city: z.string().trim().min(1, "Required").max(200),
    direction: z.enum(["INBOUND", "OUTBOUND"]),
    status: z.enum(["SUCCESS", "FAILED"]),
    durationSeconds: z.coerce.number().int().min(0, "Must be 0 or more"),
    cost: z.coerce.number().min(0, "Must be 0 or more"),
    startTime: z.string().min(1, "Required"),
    endTime: z.string().min(1, "Required"),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

/** Before zod's number coercion runs (what the form fields/defaultValues hold). */
export type CallRecordFormInput = z.input<typeof callRecordSchema>;
/** After coercion and validation (what the submit handler receives). */
export type CallRecordFormValues = z.output<typeof callRecordSchema>;
