"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { documentTemplates, getTemplateLabel } from "@/lib/document-templates";
import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const typeBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  invoice: "secondary",
};

export function DocumentList() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const documents = useQuery(api.documents.list, { type: typeFilter });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter(undefined)}
        >
          Все
        </Button>
        {documentTemplates.map((t) => (
          <Button
            key={t.type}
            variant={typeFilter === t.type ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(t.type)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {documents === undefined ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : documents.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          Документы не найдены
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc._id}>
                <TableCell>
                  <Link
                    href={`/documents/${doc._id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    №{doc.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadgeVariant[doc.type] ?? "default"}>
                    {getTemplateLabel(doc.type)}
                  </Badge>
                </TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(doc.updatedAt).toLocaleDateString("ru-RU")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
