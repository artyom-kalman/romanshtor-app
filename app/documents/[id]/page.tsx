"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { DocumentForm } from "@/components/documents/document-form";
import { DocumentActions } from "@/components/documents/document-actions";
import { getTemplate, getTemplateLabel } from "@/lib/document-templates";
import { useServerMutation } from "@/hooks/use-server-mutation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Link from "next/link";

export default function DocumentViewPage() {
  const params = useParams();
  const id = params.id as Id<"documents">;
  const document = useQuery(api.documents.get, { id });
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useServerMutation(api.documents.update);

  const template = document ? getTemplate(document.type) : undefined;

  const handleUpdate = async (fields: Record<string, string>) => {
    if (!document) {
      return;
    }
    setIsSubmitting(true);
    try {
      await updateMutation({ id: document._id, fields });
      toast.success("Документ обновлён");
      setEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          {document === undefined ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : document === null ? (
            <p className="text-center text-muted-foreground">
              Документ не найден
            </p>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/documents">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Назад
                  </Link>
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {document.title} №{document.number}
                    </h2>
                    <Badge>{getTemplateLabel(document.type)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Обновлён:{" "}
                    {new Date(document.updatedAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <DocumentActions documentId={document._id} />
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Редактировать
                  </Button>
                )}
              </div>

              {template && (
                <div className="max-w-xl">
                  {editing ? (
                    <DocumentForm
                      template={template}
                      initialValues={document.fields}
                      onSubmit={handleUpdate}
                      isSubmitting={isSubmitting}
                    />
                  ) : (
                    <dl className="space-y-3">
                      {template.fields.map((field) => {
                        const value = document.fields[field.id];
                        if (!value) {
                          return null;
                        }
                        return (
                          <div key={field.id}>
                            <dt className="text-sm font-medium text-muted-foreground">
                              {field.label}
                            </dt>
                            <dd className="mt-0.5">{value}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
