"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Mail, Shield, User } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

export function UserList() {
  const users = useQuery(api.users.list);
  const deleteUser = useMutation(api.users.deleteUser);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
      toast.error("Не удалось удалить пользователя");
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
              <span>{user.name || "Без имени"}</span>
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
            {user.username && (
              <div className="text-muted-foreground">@{user.username}</div>
            )}
            {user.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            )}
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setConfirmId(user._id)}
                >
                  <Trash2 className="size-4" />
                  Удалить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
