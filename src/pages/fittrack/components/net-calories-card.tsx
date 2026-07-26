import { Zap, Flame, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetCaloriesCardProps {
  eaten: number;
  burned: number;
  goal: number;
  onAddEaten: (amount: number) => void;
  onAddBurned: (amount: number) => void;
  className?: string;
}

/**
 * Combined calorie card: the user logs eaten and burned separately, and the
 * headline shows NET calories (eaten − burned) measured against the goal.
 * Matches the visual language of MetricCard.
 */
export function NetCaloriesCard({
  eaten,
  burned,
  goal,
  onAddEaten,
  onAddBurned,
  className,
}: NetCaloriesCardProps) {
  const net = eaten - burned;
  const percentage = Math.min(100, Math.max(0, (net / goal) * 100));
  const isComplete = net >= goal;

  const chipBase =
    "flex-1 h-8 rounded text-[11px] font-black uppercase tracking-tighter active:scale-95 transition-all";

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-4 flex flex-col relative overflow-hidden transition-all duration-300 h-full justify-between shadow-glow-orange",
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#2C2C2E] flex items-center justify-center text-lg">
            🍽️
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[13px] uppercase tracking-tighter text-zinc-900 dark:text-white">
              Net Calories
            </span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Eaten − Burned</span>
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-[11px] font-black uppercase",
            isComplete ? "text-green-500" : "text-zinc-500"
          )}
        >
          {isComplete ? "GOAL" : "LIVE"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-8 w-full bg-zinc-100 dark:bg-[#2C2C2E] rounded-md overflow-hidden relative border border-zinc-200 dark:border-white/5 shadow-inner">
          <div
            className="h-full transition-all duration-1000 ease-out bg-orange-500"
            style={{
              width: `${percentage}%`,
              backgroundImage: `repeating-linear-gradient(
                -70deg,
                rgba(0,0,0,0.1),
                rgba(0,0,0,0.1) 6px,
                transparent 6px,
                transparent 12px
              )`,
            }}
          />
        </div>
      </div>

      {/* Net value */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
            {net.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-zinc-500 uppercase">kcal net</span>
        </div>

        <div className="h-8 w-16 opacity-50">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            <path
              d="M0 35 Q 20 5, 40 25 T 80 15 T 100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-orange-500"
            />
            <circle cx="100" cy="5" r="3" className="fill-current text-orange-500" />
          </svg>
        </div>
      </div>

      {/* Stats: Eaten / Burned / Goal */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-[#2C2C2E] mb-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Eaten</span>
          <span className="text-[11px] font-black text-orange-500">{eaten.toLocaleString()}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-100 dark:border-[#2C2C2E] pl-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Burned</span>
          <span className="text-[11px] font-black text-purple-500">{burned.toLocaleString()}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-100 dark:border-[#2C2C2E] pl-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Goal</span>
          <span className="text-[11px] font-black text-zinc-900 dark:text-white">{goal.toLocaleString()}</span>
        </div>
      </div>

      {/* Dual log controls */}
      <div className="space-y-2">
        {/* Eaten */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 w-[52px] shrink-0 text-[10px] font-black uppercase tracking-tighter text-orange-500">
            <Utensils className="h-3 w-3" /> Eat
          </span>
          <button
            className={cn(chipBase, "bg-zinc-100 dark:bg-[#2C2C2E] text-zinc-500 dark:text-zinc-400")}
            onClick={() => onAddEaten(-100)}
          >
            −100
          </button>
          <button
            className={cn(chipBase, "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-black")}
            onClick={() => onAddEaten(100)}
          >
            +100
          </button>
          <button
            className={cn(chipBase, "bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-black")}
            onClick={() => onAddEaten(500)}
          >
            +500
          </button>
        </div>

        {/* Burned */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 w-[52px] shrink-0 text-[10px] font-black uppercase tracking-tighter text-purple-500">
            <Flame className="h-3 w-3" /> Burn
          </span>
          <button
            className={cn(chipBase, "bg-zinc-100 dark:bg-[#2C2C2E] text-zinc-500 dark:text-zinc-400")}
            onClick={() => onAddBurned(-100)}
          >
            −100
          </button>
          <button
            className={cn(chipBase, "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white")}
            onClick={() => onAddBurned(100)}
          >
            +100
          </button>
          <button
            className={cn(chipBase, "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white")}
            onClick={() => onAddBurned(300)}
          >
            +300
          </button>
        </div>
      </div>
    </div>
  );
}
