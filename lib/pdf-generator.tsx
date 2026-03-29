"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { Doc } from "@/convex/_generated/dataModel";
import { getTemplate, getTemplateLabel } from "@/lib/document-templates";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function registerFonts() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  Font.register({
    family: "Roboto",
    fonts: [
      { src: `${origin}/fonts/Roboto-Regular.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/Roboto-Bold.ttf`, fontWeight: 700 },
    ],
  });
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", fontSize: 11 },
  header: { textAlign: "center", marginBottom: 20 },
  companyName: { fontSize: 16, fontWeight: 700 },
  companyInfo: { fontSize: 9, color: "#666", marginTop: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 12 },
  title: { textAlign: "center", fontSize: 14, fontWeight: 700, marginBottom: 4 },
  date: { textAlign: "center", fontSize: 9, color: "#666", marginBottom: 16 },
  fieldRow: { flexDirection: "row", marginBottom: 8 },
  fieldLabel: { width: 160, fontWeight: 700, color: "#555" },
  fieldValue: { flex: 1 },
  signatures: { flexDirection: "row", marginTop: 60, justifyContent: "space-between" },
  signatureBlock: { width: "45%", alignItems: "center" },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#000", width: "100%", marginBottom: 4 },
  signatureLabel: { fontSize: 9, color: "#666" },
});

function DocumentPdf({ document }: { document: Doc<"documents"> }) {
  const template = getTemplate(document.type);
  if (!template) {
    throw new Error(`Неизвестный тип документа: ${document.type}`);
  }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>ООО «Римские Шторы»</Text>
          <Text style={styles.companyInfo}>
            г. Москва · тел. +7 (495) 000-00-00
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.title}>
          {getTemplateLabel(document.type)} №{document.number}
        </Text>
        <Text style={styles.date}>
          от {new Date(document._creationTime).toLocaleDateString("ru-RU")}
        </Text>
        {template.fields.map((field) => {
          const value = document.fields[field.id];
          if (!value) {
            return null;
          }
          return (
            <View key={field.id} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}:</Text>
              <Text style={styles.fieldValue}>{value}</Text>
            </View>
          );
        })}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Подпись исполнителя</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Подпись заказчика</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function PdfDownloadButton({
  document,
}: {
  document: Doc<"documents">;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      registerFonts();
      const blob = await pdf(<DocumentPdf document={document} />).toBlob();
      const url = URL.createObjectURL(blob);
      try {
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${getTemplateLabel(document.type)}_${document.number}.pdf`;
        a.click();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Не удалось сгенерировать PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} disabled={loading}>
      <Download className="mr-1 h-4 w-4" />
      {loading ? "Генерация..." : "Скачать PDF"}
    </Button>
  );
}
