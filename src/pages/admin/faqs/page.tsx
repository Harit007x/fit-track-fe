import {
  Badge,
} from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import IconWrapper from "@/components/icons-wrapper";
import { Icons } from "@/components/icons";
import { DataTableColumnHeader } from "@/components/data-table/data-column-header";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Sale = {
  question: string;
  status: string;
};

const faqData: Sale[] = [
  {
    question: "Can I make payments in dollor ?",
    status: "Normal",
  },
  {
    question: "Can I change my name from profile ?",
    status: "Medium",
  },
];

const ActionsCell = ({ row }: { row: any }) => {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState(row.original);

  return (
    <div className="w-fit flex gap-1">
      <IconWrapper
        className="cursor-pointer text-blue hover:fill-blueBackground hover:bg-blueBackground hover:dark:bg-blueBackground"
        onClick={() => setIsEditOpen(true)}
      >
        <Icons.pencil className="h-4 w-4" />
      </IconWrapper>
      <IconWrapper
        className="cursor-pointer text-red hover:fill-redBackground hover:bg-redBackground hover:dark:bg-redBackground"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Icons.trash className="h-4 w-4" />
      </IconWrapper>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("faqs.editTitle")}</SheetTitle>
            <SheetDescription>
              {t("faqs.editDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="question" className="text-right">
                {t("faqs.labelQuestion")}
              </Label>
              <Input
                id="question"
                value={editForm.question}
                onChange={(e) =>
                  setEditForm({ ...editForm, question: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit">{t("common.save")}</Button>
            <SheetClose asChild>
              <Button variant="outline">{t("common.close")}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("faqs.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("faqs.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsDeleteOpen(false)}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};



export default function AdminFaqsPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      header: () => t("faqs.labelQuestion"),
      accessorKey: "question",
    },
    {
      id: "status",
      header: () => t("common.status"),
      cell: ({ row }) => {
        const sale = row.original;

        return (
          <Badge
            variant={
              sale.status === "Success"
                ? "green"
                : sale.status === "Medium"
                  ? "orange"
                  : "blue"
            }
          >
            {t(`status.${sale.status.toLowerCase()}`)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.actions")} />
      ),
      cell: ({ row }) => <ActionsCell row={row} />,
    },
  ], [t]);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="inline-block text-xl justify-self-start font-bold tracking-tight">
          {t("faqs.title")}
        </h2>
        <p className="text-sm font-medium">{t("faqs.description")}</p>
      </div>

      <DataTable
        columns={columns}
        data={faqData}
        gridCount={faqData.length}
      />
    </div>
  );
}

