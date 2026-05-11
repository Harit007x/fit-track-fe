import clsx from "clsx";
import { useTheme } from "next-themes";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import { SideNavToggleBtn } from "./side-nav-toggle-btn";

interface IHeader {
  collapsed: boolean;
  toggleCollapse: () => void;
}

function Header(props: IHeader) {
  const { setTheme, theme } = useTheme();

  return (
    <div
      className={clsx(
        "sticky top-0 z-30 flex justify-between h-16 bg-background justify-between items-center border-b border-sidebar-border bg-sidebar px-4",
        { "justify-end": !props.collapsed }
      )}
    >
      <SideNavToggleBtn
        toggleCollapse={props.toggleCollapse}
        collapsed={!props.collapsed}
        children={
          <Icons.panelLeftOpen className="h-4.5 w-4.5 m-[0.1rem] text-muted-foreground group-hover:text-text" />
        }
        className={clsx({ hidden: !props.collapsed })}
      />
      {theme === "light" ? (
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setTheme("dark")}
          className="rounded-full"
        >
          <Icons.moon className="rotate-0 scale-100 transition-all" />
        </Button>
      ) : (
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setTheme("light")}
          className="rounded-full"
        >
          <Icons.sun className="rotate-0 scale-100 transition-all text-foreground" />
        </Button>
      )}
    </div>
  );
}

export default Header;
