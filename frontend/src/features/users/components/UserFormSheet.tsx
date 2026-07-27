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
import { createUserSchema, type CreateUserFormValues } from "@/features/users/schemas";
import type { CreateUserInput } from "@/services/api/users.api";

const DEFAULT_VALUES: CreateUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "ANALYST",
};

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateUserInput) => Promise<unknown>;
  isSubmitting: boolean;
}

export function UserFormSheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: UserFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  async function handleFormSubmit(values: CreateUserFormValues) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>New user</SheetTitle>
          <SheetDescription>Create a platform account with a chosen role.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-name">Full name</Label>
            <Input id="new-user-name" autoComplete="off" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-email">Email</Label>
            <Input id="new-user-email" type="email" autoComplete="off" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-password">Password</Label>
            <Input
              id="new-user-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-role">Role</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as "ADMIN" | "ANALYST")}
            >
              <SelectTrigger id="new-user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANALYST">Analyst (view-only)</SelectItem>
                <SelectItem value="ADMIN">Admin (full access)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t p-0 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create user"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
