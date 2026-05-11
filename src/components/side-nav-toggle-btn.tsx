import type { ReactNode } from "react";

interface SideNavToggleBtnProps {
  toggleCollapse: () => void;
  collapsed: boolean;
  children: ReactNode;
  className?: string;
}

export const SideNavToggleBtn = (props: SideNavToggleBtnProps) => {
  return (
    <div
      onClick={props.toggleCollapse}
      className={`group hover:bg-accent p-1 w-fit h-fit rounded-md cursor-pointer ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
};
