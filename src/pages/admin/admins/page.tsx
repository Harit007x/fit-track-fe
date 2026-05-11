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
  name: string;
  email: string;
  amount: string;
  status: string;
  date: string;
};

const adminUsers: Sale[] = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    status: "Success",
    date: "2023-01-23",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    status: "Pending",
    date: "2023-02-12",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    status: "Success",
    date: "2023-03-05",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    status: "Processing",
    date: "2023-04-15",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    status: "Success",
    date: "2023-05-20",
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
            <SheetTitle>{t("admins.editTitle")}</SheetTitle>
            <SheetDescription>
              {t("admins.editDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="name" className="text-right">
                {t("users.labelName")}
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-right">
                {t("users.labelEmail")}
              </Label>
              <Input
                id="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
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
            <AlertDialogTitle>{t("admins.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admins.deleteDescription")}
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



export default function AdminAdminsPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      header: () => t("users.labelName"),
      accessorKey: "name",
    },
    {
      header: () => t("users.labelEmail"),
      accessorKey: "email",
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
                : sale.status === "Pending"
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
      header: () => t("common.method"),
      accessorKey: "date",
    },
    {
      header: () => t("common.amount"),
      accessorKey: "amount",
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
          {t("admins.title")}
        </h2>
        <p className="text-sm font-medium">{t("admins.description")}</p>
      </div>

      <DataTable
        columns={columns}
        data={adminUsers}
        gridCount={adminUsers.length}
      />
    </div>
  );
}

