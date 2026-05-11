import type { ReactNode } from 'react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip'

interface TooltipTrigger {
    children: ReactNode
    content: string
    showTooltip?: boolean
}
function CommonTooltip({ children, content, showTooltip = true }: TooltipTrigger) {
    return (
        <div className='z-50'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>

                    {showTooltip &&
                        <TooltipContent side={'bottom'}>
                            <div className="border bg-secondary rounded-md p-3 text-sm  ">
                                <h1 className="font-bold text-sm text-foreground"> {content}</h1>
                            </div>
                        </TooltipContent>
                    }
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default CommonTooltip

