import { useState } from "react";
import { UserX, UserCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TablePagination } from "@/components/table/TablePagination";
import { useUserMutations, useUsers } from "@/features/users/hooks/useUsers";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError } from "@/services/api/client";
import type { Role } from "@/types/auth";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isPending, isError, error, refetch } = useUsers({ page, limit: 20, search });
  const { update, remove } = useUserMutations();

  if (isError) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Users" description="Manage platform accounts and access levels." />
        <ErrorState
          message={error instanceof ApiError ? error.message : "Failed to load users."}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Users" description="Manage platform accounts and access levels." />

      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4.5 py-3.5">
          <h2 className="text-[13.5px] font-semibold">All users</h2>
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email..."
            aria-label="Search users"
            className="w-56 text-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending &&
                Array.from({ length: 6 }, (_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isPending &&
                data?.items.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name}
                        {isSelf && (
                          <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          disabled={isSelf || update.isPending}
                          onValueChange={(role) =>
                            update.mutate({ id: u.id, input: { role: role as Role } })
                          }
                        >
                          <SelectTrigger size="sm" className="w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="ANALYST">Analyst</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? "outline" : "destructive"}>
                          {u.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={isSelf || update.isPending}
                            aria-label={u.isActive ? "Deactivate user" : "Activate user"}
                            onClick={() =>
                              update.mutate({ id: u.id, input: { isActive: !u.isActive } })
                            }
                          >
                            {u.isActive ? (
                              <UserX className="size-3.5" aria-hidden="true" />
                            ) : (
                              <UserCheck className="size-3.5" aria-hidden="true" />
                            )}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={isSelf || remove.isPending}
                            aria-label="Delete user"
                            onClick={() => {
                              if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) {
                                remove.mutate(u.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {!isPending && data?.items.length === 0 && (
          <EmptyState message="No users match your search." />
        )}

        {!isPending && data && data.items.length > 0 && (
          <TablePagination pagination={data.pagination} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
