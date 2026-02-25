"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const { signIn } = useAuthActions();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn("credentials", { username, password });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось войти",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn("resend", { email });
      setIsSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить ссылку",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Проверьте почту</CardTitle>
          <CardDescription>
            Мы отправили ссылку на{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSent(false);
              setEmail("");
            }}
          >
            Другой email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в систему</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="credentials" onValueChange={() => setError(null)}>
          <TabsList>
            <TabsTrigger value="credentials">Логин и пароль</TabsTrigger>
            <TabsTrigger value="magic-link">Email-ссылка</TabsTrigger>
          </TabsList>

          <div className="min-h-[232px]">
          <TabsContent value="credentials">
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic-link">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Отправка..." : "Отправить ссылку"}
              </Button>
            </form>
          </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
