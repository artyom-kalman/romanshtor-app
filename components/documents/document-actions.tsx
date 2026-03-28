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

  const handleDelete = async () => {
    await removeMutation({ id: documentId });
    setOpen(false);
    toast.success("Документ в архиве");
    router.push("/documents");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/documents/${documentId}/print`}>
          <Printer className="mr-1 h-4 w-4" />
          Печать
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              В архив
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
