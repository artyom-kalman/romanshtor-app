export type FieldType = "text" | "number" | "date" | "textarea" | "select";

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface DocumentTemplate {
  type: string;
  label: string;
  icon: string;
  fields: TemplateField[];
}

export const documentTemplates: DocumentTemplate[] = [
  {
    type: "invoice",
    label: "Счёт",
    icon: "Receipt",
    fields: [
      { id: "product_description", label: "Описание товара", type: "textarea", required: true, placeholder: "Римская штора, ткань ..." },
      { id: "quantity", label: "Количество", type: "number", required: true, placeholder: "1" },
      { id: "unit_price", label: "Цена за единицу (₽)", type: "number", required: true, placeholder: "15000" },
      { id: "total", label: "Итого (₽)", type: "number", required: true, placeholder: "15000" },
      { id: "payment_method", label: "Способ оплаты", type: "select", required: true, options: ["Наличные", "Карта", "Перевод"] },
      { id: "notes", label: "Примечания", type: "textarea", required: false, placeholder: "Дополнительные заметки" },
    ],
  },
];

export function getTemplate(type: string): DocumentTemplate | undefined {
  return documentTemplates.find((t) => t.type === type);
}

export function getTemplateLabel(type: string): string {
  return getTemplate(type)?.label ?? type;
}
