"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, Mail, MapPin, StickyNote } from "lucide-react";

export function ClientList() {
  const clients = useQuery(api.clients.list);

  if (clients === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <Users className="size-10" />
        <p>Клиентов пока нет</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => {
        const fullName = [client.lastName, client.firstName, client.patronymic]
          .filter(Boolean)
          .join(" ");
        const address = client.addresses[0]?.address;

        return (
          <Card key={client._id}>
            <CardHeader>
              <CardTitle>{fullName}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span>{address}</span>
                </div>
              )}
              {client.notes && (
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{client.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
