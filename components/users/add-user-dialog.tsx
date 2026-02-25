"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  username: "",
  password: "",
  name: "",
  role: "user" as "admin" | "user",
  email: "",
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const createUser = useAction(api.users.createUser);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = "Введите имя";
    }
    if (!form.username.trim()) {
      newErrors.username = "Введите имя пользователя";
    }
    if (!form.password.trim()) {
      newErrors.password = "Введите пароль";
    }
    if (form.password.length > 0 && form.password.length < 6) {
      newErrors.password = "Минимум 6 символов";
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
      await createUser({
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        role: form.role,
        email: form.email.trim() || undefined,
      });
      setOpen(false);
      toast.success("Пользователь создан");
    } catch {
      toast.error("Не удалось создать пользователя");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm(initialForm);
      setErrors({});
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Отображаемое имя"
            required
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            error={errors.name}
          />
          <Field
            label="Имя пользователя"
            required
            value={form.username}
            onChange={(v) => handleChange("username", v)}
            error={errors.username}
          />
          <Field
            label="Пароль"
            required
            type="password"
            value={form.password}
            onChange={(v) => handleChange("password", v)}
            error={errors.password}
          />
          <div className="flex flex-col gap-1.5">
            <Label>Роль</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === "user"}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
                Пользователь
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === "admin"}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
                Администратор
              </label>
            </div>
          </div>
          <Field
            label="Email (необязательно)"
            type="email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
          />
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
