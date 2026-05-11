import clsx from "clsx";
import type { ReactNode } from "react";
import CommonTooltip from "./common-tooltip";
import { Button } from "./ui/button";

interface IIconWrapperProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disable?: boolean;
  tooltipContent?: string;
}

const IconWrapper = ({ children, onClick, className, disable, tooltipContent = "" }: IIconWrapperProps) => {
  return (
    <CommonTooltip content={tooltipContent} showTooltip={tooltipContent != ""}>
      <Button
        className={clsx(
          `flex justify-center items-center p-0 h-7 w-7 m-0 rounded-md bg-transparent hover:dark:bg-blueBackground text-foreground ${className}`,
          {
            "cursor-not-allowed hover:bg-transparent hover:dark:bg-transparent hover:text-slate-400":
              disable,
          }
        )}
        disabled={disable}
        onClick={onClick}

      >
        {children}
      </Button>
    </CommonTooltip>
  );
};

export default IconWrapper;
