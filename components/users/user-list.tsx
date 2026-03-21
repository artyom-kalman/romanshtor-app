"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Shield, User, Pencil } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { useServerMutation } from "@/hooks/use-server-mutation";
import { EditUserDialog } from "./edit-user-dialog";

export function UserList() {
  const users = useQuery(api.users.list);
  const deleteUser = useServerMutation(api.users.deleteUser);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<{
    _id: Id<"users">;
    role?: string;
    username?: string;
  } | null>(null);

  if (users === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <Users className="size-10" />
        <p>Пользователей пока нет</p>
      </div>
    );
  }

  async function handleDelete(userId: Id<"users">) {
    setDeletingId(userId);
    try {
      await deleteUser({ userId });
      toast.success("Пользователь удалён");
    } catch {
      // error already toasted by useServerMutation
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{user.username}</span>
              <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                {user.role === "admin" ? (
                  <Shield className="size-3.5" />
                ) : (
                  <User className="size-3.5" />
                )}
                {user.role === "admin" ? "Админ" : "Пользователь"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="mt-2">
              {confirmId === user._id ? (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === user._id}
                    onClick={() => handleDelete(user._id)}
                  >
                    {deletingId === user._id ? "Удаление..." : "Подтвердить"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmId(null)}
                  >
                    Отмена
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setEditUser(user)}
                  >
                    <Pencil className="size-4" />
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setConfirmId(user._id)}
                  >
                    <Trash2 className="size-4" />
                    Удалить
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => {
            if (!open) {
              setEditUser(null);
            }
          }}
        />
      )}
    </div>
  );
}
