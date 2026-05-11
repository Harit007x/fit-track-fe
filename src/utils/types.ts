import type { JSX } from "react";

export type SideNavItem = {
  title: string;
  path: string;
  indicator?: boolean;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type AppError = {
  error: {
    data: {
      message: string;
    };
  };
};

export interface SideNavState {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}

export type SideNavbar = {
  title: string;
  items: SideNavItem[];
};
