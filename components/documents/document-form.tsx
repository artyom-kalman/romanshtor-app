"use client";

import { useState } from "react";
import { DocumentTemplate } from "@/lib/document-templates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


interface DocumentFormProps {
  template: DocumentTemplate;
  initialValues?: Record<string, string>;
  onSubmit: (fields: Record<string, string>) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function DocumentForm({
  template,
  initialValues = {},
  onSubmit,
  isSubmitting,
  submitLabel = "Сохранить",
}: DocumentFormProps) {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of template.fields) {
      initial[field.id] = initialValues[field.id] ?? "";
    }
    return initial;
  });

  const updateField = (id: string, value: string) => {
    setFields((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of template.fields) {
      if (field.required && !fields[field.id]) {
        toast.error(`Заполните поле «${field.label}»`);
        const el = document.getElementById(field.id);
        el?.focus();
        return;
      }
    }
    onSubmit(fields);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {template.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>

          {field.type === "select" ? (
            <Select
              value={fields[field.id]}
              onValueChange={(value) => updateField(field.id, value)}
              required={field.required}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder="Выберите..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "textarea" ? (
            <Textarea
              id={field.id}
              value={fields[field.id]}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          ) : (
            <Input
              id={field.id}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={fields[field.id]}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохранение..." : submitLabel}
      </Button>
    </form>
  );
}
