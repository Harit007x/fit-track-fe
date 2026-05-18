import { Minus, Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAdd {
  label: string;
  amount: number;
}

interface MetricCardProps {
  title: string;
  emoji: string;
  value: number;
  goal: number;
  unit: string;
  colorClass: string; // e.g., "text-orange-500"
  glowClass: string; // e.g., "shadow-glow-orange"
  barColor: string; // e.g., "bg-orange-500"
  onIncrement: (amount: number) => void;
  quickAddOptions?: QuickAdd[];
  className?: string;
}

export function MetricCard({
  title,
  emoji,
  value,
  goal,
  unit,
  colorClass,
  glowClass,
  barColor,
  onIncrement,
  quickAddOptions,
  className,
}: MetricCardProps) {
  const percentage = Math.min(100, Math.max(0, (value / goal) * 100));
  const remaining = Math.max(0, goal - value);
  const isComplete = value >= goal;

  return (
    <div className={cn(
      "bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-4 flex flex-col relative overflow-hidden transition-all duration-300 h-full justify-between",
      glowClass,
      className
    )}>
      {/* Top Section: Icon, Label & Time */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#2C2C2E] flex items-center justify-center text-lg">
            {emoji}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[13px] uppercase tracking-tighter text-zinc-900 dark:text-white">
              {title}
            </span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase">ACTIVE SESSION</span>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-zinc-500">8:21 AM</span>
      </div>

      {/* Progress Bar Section (Reference 2 Inspired) */}
      <div className="mb-4">
        <div className="h-8 w-full bg-zinc-100 dark:bg-[#2C2C2E] rounded-md overflow-hidden relative border border-zinc-200 dark:border-white/5 shadow-inner">
          <div
            className={cn("h-full transition-all duration-1000 ease-out", barColor)}
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
      {/* Value Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
            {value.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-zinc-500 uppercase">
            {unit}
          </span>
        </div>

        {/* Sparkline Decorative SVG */}
        <div className="h-8 w-16 opacity-50">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            <path
              d="M0 35 Q 20 5, 40 25 T 80 15 T 100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={colorClass}
            />
            <circle cx="100" cy="5" r="3" className={cn("fill-current", colorClass)} />
          </svg>
        </div>
      </div>

      {/* Stats Divider Section (Reference 2 Inspired) */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-[#2C2C2E] mb-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Goal</span>
          <span className="text-[11px] font-black text-zinc-900 dark:text-white">{goal}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-100 dark:border-[#2C2C2E] pl-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Left</span>
          <span className="text-[11px] font-black text-zinc-900 dark:text-white">{remaining}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-100 dark:border-[#2C2C2E] pl-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Status</span>
          <span className="text-[11px] font-black text-green-500 uppercase">{isComplete ? "DONE" : "LIVE"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-zinc-100 dark:bg-[#2C2C2E] text-zinc-900 dark:text-white h-10 rounded-lg font-black text-sm flex items-center justify-center active:scale-95 transition-all shadow-sm"
          onClick={() => onIncrement(-1)}
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          className={cn(
            "flex-[2] text-white h-10 rounded-lg font-black text-sm flex items-center justify-center active:scale-95 transition-all shadow-lg",
            barColor
          )}
          onClick={() => onIncrement(1)}
        >
          <Plus className="h-4 w-4 mr-1" /> {unit.toUpperCase()}
        </button>
      </div>

      {/* Quick Add row */}
      {quickAddOptions && quickAddOptions.length > 0 && (
        <div className="flex gap-1 mt-2">
          {quickAddOptions.map((opt, i) => (
            <button
              key={i}
              className="flex-1 bg-zinc-100 dark:bg-[#2C2C2E]/50 text-zinc-500 dark:text-zinc-400 h-7 rounded text-[10px] font-black uppercase tracking-tighter active:scale-95 transition-all"
              onClick={() => onIncrement(opt.amount)}
            >
              +{opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
