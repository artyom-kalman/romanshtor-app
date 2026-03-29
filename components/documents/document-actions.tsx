"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, Archive } from "lucide-react";
import { useServerMutation } from "@/hooks/use-server-mutation";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Link from "next/link";

interface DocumentActionsProps {
  documentId: Id<"documents">;
}

export function DocumentActions({ documentId }: DocumentActionsProps) {
  const router = useRouter();
  const removeMutation = useServerMutation(api.documents.remove);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeMutation({ id: documentId });
      setOpen(false);
      toast.success("Документ в архиве");
      router.push("/documents");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не удалось архивировать",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={isDeleting} asChild>
        <Link
          href={`/documents/${documentId}/print`}
          aria-disabled={isDeleting}
          className={isDeleting ? "pointer-events-none" : ""}
        >
          <Printer className="mr-1 h-4 w-4" />
          Печать
        </Link>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!isDeleting) {
            setOpen(v);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            <Archive className="mr-1 h-4 w-4" />
            В архив
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Архивировать документ?</DialogTitle>
            <DialogDescription>
              Документ будет перемещён в архив.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Архивация..." : "В архив"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
