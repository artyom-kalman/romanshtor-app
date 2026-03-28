"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { getTemplate, getTemplateLabel } from "@/lib/document-templates";

interface DocumentPrintViewProps {
  document: Doc<"documents">;
}

export function DocumentPrintView({ document }: DocumentPrintViewProps) {
  const template = getTemplate(document.type);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="text-center">
        <h1 className="text-xl font-bold">ООО «Римские Шторы»</h1>
        <p className="text-sm text-muted-foreground">
          г. Москва · тел. +7 (495) 000-00-00
        </p>
      </div>

      <hr />

      <div className="text-center">
        <h2 className="text-lg font-semibold">
          {getTemplateLabel(document.type)} №{document.number}
        </h2>
        <p className="text-sm text-muted-foreground">
          от {new Date(document._creationTime).toLocaleDateString("ru-RU")}
        </p>
      </div>

      <dl className="space-y-3">
        {template?.fields.map((field) => {
          const value = document.fields[field.id];
          if (!value) {
            return null;
          }
          return (
            <div key={field.id} className="grid grid-cols-[180px_1fr] gap-2">
              <dt className="font-medium text-muted-foreground">
                {field.label}:
              </dt>
              <dd>{value}</dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-12 grid grid-cols-2 gap-8 pt-8">
        <div>
          <div className="border-b border-foreground" />
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Подпись исполнителя
          </p>
        </div>
        <div>
          <div className="border-b border-foreground" />
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Подпись заказчика
          </p>
        </div>
      </div>
    </div>
  );
}
