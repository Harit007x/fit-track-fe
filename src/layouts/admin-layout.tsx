import SideNav from "@/components/side-nav";
import { Icons } from "@/components/icons";
import type { SideNavbar } from "@/utils/types";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t } = useTranslation();

  const adminNavItems: SideNavbar[] = [
    {
      title: t("sidebar.home"),
      items: [
        {
          title: t("sidebar.dashboard"),
          path: "/admin/dashboard",
          icon: <Icons.home className="w-5 h-5" />,
        },
        {
          title: t("sidebar.admins"),
          path: "/admin/admins",
          icon: <Icons.shieldUser className="w-5 h-5" />,
        },
        {
          title: t("sidebar.users"),
          path: "/admin/users",
          icon: <Icons.users className="w-5 h-5" />,
        },
        {
          title: t("sidebar.cms"),
          path: "/admin/cms-pages",
          icon: <Icons.syringe className="w-5 h-5" />,
        },
        {
          title: t("sidebar.faqs"),
          path: "/admin/faqs",
          icon: <Icons.pill className="w-5 h-5" />,
        },
        {
          title: t("sidebar.inquiries"),
          path: "/admin/inquiries",
          icon: <Icons.calender className="w-5 h-5" />,
        },
        {
          title: t("sidebar.settings"),
          path: "/admin/settings",
          icon: <Icons.user className="w-5 h-5" />,
        },
      ],
    },
  ];

  return (
    <SideNav navBar={adminNavItems}>
      <div className="max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </SideNav>
  );
}
