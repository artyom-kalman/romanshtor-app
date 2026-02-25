"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SetupForm() {
  const seed = useAction(api.users.seed);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsLoading(true);

    try {
      await seed({
        username: form.username,
        password: form.password,
        name: form.name,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать администратора",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Создание администратора</CardTitle>
        <CardDescription>
          Создайте первого пользователя для начала работы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setup-name">Отображаемое имя</Label>
            <Input
              id="setup-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-username">Имя пользователя</Label>
            <Input
              id="setup-username"
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-password">Пароль</Label>
            <Input
              id="setup-password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setup-confirm">Подтвердите пароль</Label>
            <Input
              id="setup-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать администратора"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
