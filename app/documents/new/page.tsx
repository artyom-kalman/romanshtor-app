"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { DocumentTypePicker } from "@/components/documents/document-type-picker";
import { DocumentForm } from "@/components/documents/document-form";
import { getTemplate, getTemplateLabel } from "@/lib/document-templates";
import { useServerMutation } from "@/hooks/use-server-mutation";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function NewDocumentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromQuery = searchParams.get("type");
  const [selectedType, setSelectedType] = useState<string | null>(typeFromQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useServerMutation(api.documents.create);

  const template = selectedType ? getTemplate(selectedType) : undefined;

  const handleSubmit = async (fields: Record<string, string>) => {
    if (!selectedType || !template) {
      return;
    }
    setIsSubmitting(true);
    try {
      const title = `${getTemplateLabel(selectedType)}`;
      const id = await createMutation({ type: selectedType, title, fields });
      toast.success("Документ создан");
      router.push(`/documents/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не удалось создать документ",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {!selectedType ? (
        <>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Выберите тип документа
          </h2>
          <DocumentTypePicker onSelect={setSelectedType} />
        </>
      ) : template ? (
        <>
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Назад
            </Button>
            <h2 className="text-2xl font-semibold tracking-tight">
              Новый: {template.label}
            </h2>
          </div>
          <div className="max-w-xl">
            <DocumentForm
              template={template}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Создать"
            />
          </div>
        </>
      ) : null}
    </main>
  );
}

export default function NewDocumentPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <Suspense>
          <NewDocumentContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
