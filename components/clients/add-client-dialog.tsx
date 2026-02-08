"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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
  lastName: "",
  firstName: "",
  patronymic: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export function AddClientDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.clients.create);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.lastName.trim()) newErrors.lastName = "Введите фамилию";
    if (!form.firstName.trim()) newErrors.firstName = "Введите имя";
    if (!form.phone.trim()) newErrors.phone = "Введите телефон";
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
      await create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        patronymic: form.patronymic.trim() || undefined,
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setOpen(false);
      toast.success("Клиент добавлен");
    } catch {
      toast.error("Не удалось добавить клиента");
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
          Добавить клиента
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый клиент</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Фамилия"
            required
            value={form.lastName}
            onChange={(v) => handleChange("lastName", v)}
            error={errors.lastName}
          />
          <Field
            label="Имя"
            required
            value={form.firstName}
            onChange={(v) => handleChange("firstName", v)}
            error={errors.firstName}
          />
          <Field
            label="Отчество"
            value={form.patronymic}
            onChange={(v) => handleChange("patronymic", v)}
          />
          <Field
            label="Телефон"
            required
            type="tel"
            value={form.phone}
            onChange={(v) => handleChange("phone", v)}
            error={errors.phone}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
          />
          <Field
            label="Адрес"
            value={form.address}
            onChange={(v) => handleChange("address", v)}
          />
          <Field
            label="Заметки"
            value={form.notes}
            onChange={(v) => handleChange("notes", v)}
          />
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
