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
  sender: string;
  senderMail: string;
  subject: string;
  status: string;
};

const inquiryData: Sale[] = [
  {
    sender: "William Kim",
    senderMail: "will@email.com",
    subject: "Help with payment ?",
    status: "Normal",
  },
  {
    sender: "Sofia Davis",
    senderMail: "sofia.davis@email.com",
    subject: "Help with services ?",
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
            <SheetTitle>{t("inquiries.editTitle")}</SheetTitle>
            <SheetDescription>
              {t("inquiries.editDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sender" className="text-right">
                {t("inquiries.labelSender")}
              </Label>
              <Input
                id="sender"
                value={editForm.sender}
                onChange={(e) =>
                  setEditForm({ ...editForm, sender: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="subject" className="text-right">
                {t("inquiries.labelSubject")}
              </Label>
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm({ ...editForm, subject: e.target.value })
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
            <AlertDialogTitle>{t("inquiries.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inquiries.deleteDescription")}
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



export default function AdminInquiriesPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      id: "sender",
      header: () => t("inquiries.labelSender"),
      cell: ({ row }) => {
        const sale = row.original;

        return (
          <div className="flex flex-col">
            <span>{sale.sender}</span>
            <span className="text-foreground/50">{sale.senderMail}</span>
          </div>
        );
      },
    },
    {
      header: () => t("inquiries.labelSubject"),
      accessorKey: "subject"
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
          {t("inquiries.title")}
        </h2>
        <p className="text-sm font-medium">{t("inquiries.description")}</p>
      </div>

      <DataTable
        columns={columns}
        data={inquiryData}
        gridCount={inquiryData.length}
      />
    </div>
  );
}

