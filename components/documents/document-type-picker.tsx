"use client";

import { documentTemplates } from "@/lib/document-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Receipt,
};

interface DocumentTypePickerProps {
  onSelect: (type: string) => void;
}

export function DocumentTypePicker({ onSelect }: DocumentTypePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {documentTemplates.map((template) => {
        const Icon = iconMap[template.icon];
        return (
          <Card
            key={template.type}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => onSelect(template.type)}
          >
            <CardContent className="flex flex-col items-center gap-3 py-8">
              {Icon && <Icon className="h-10 w-10 text-muted-foreground" />}
              <span className="text-lg font-medium">{template.label}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
