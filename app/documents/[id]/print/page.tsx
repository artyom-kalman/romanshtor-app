"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DocumentPrintView } from "@/components/documents/document-print-view";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const PdfDownloadButton = dynamic(
  () => import("@/lib/pdf-generator").then((m) => m.PdfDownloadButton),
  { ssr: false },
);

export default function PrintPage() {
  const params = useParams();
  const id = params.id as Id<"documents">;
  const document = useQuery(api.documents.get, { id });

  return (
    <AuthGuard>
      {document === undefined ? (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      ) : document === null ? (
        <p className="p-8 text-center text-muted-foreground">
          Документ не найден
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 p-4 print:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/documents/${id}`}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Назад
              </Link>
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" />
              Печать
            </Button>
            <PdfDownloadButton document={document} />
          </div>
          <DocumentPrintView document={document} />
        </>
      )}
    </AuthGuard>
  );
}
