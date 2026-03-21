"use client";

import { useState } from "react";
import { useServerAction, useServerMutation } from "@/hooks/use-server-mutation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: { _id: Id<"users">; username?: string; role?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const updateUsername = useServerMutation(api.users.updateUsername);
  const updatePassword = useServerAction(api.users.updatePassword);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (username.trim() && username.trim().length < 3) {
      newErrors.username = "Введите имя пользователя";
    }
    if (password && password.length < 6) {
      newErrors.password = "Минимум 6 символов";
    }
    if (!username.trim() && !password) {
      newErrors.username = "Заполните хотя бы одно поле";
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (username.trim()) {
        await updateUsername({ userId: user._id, newUsername: username.trim() });
      }
      if (password) {
        await updatePassword({ userId: user._id, newPassword: password });
      }
      toast.success("Пользователь обновлён");
      onOpenChange(false);
    } catch {
      // error already toasted by hooks
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setUsername("");
      setPassword("");
      setErrors({});
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать: {user.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Новое имя пользователя</Label>
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
              placeholder={user.username}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Новый пароль</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Оставьте пустым, чтобы не менять"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
