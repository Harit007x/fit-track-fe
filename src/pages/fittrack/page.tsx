import { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { useFitTrackStore, goalMetrics } from "@/hooks/use-fittrack-store";
import { MetricCard } from "./components/metric-card";
import { Moon, Sun, TrendingUp, Activity } from "lucide-react";
import { useTheme } from "next-themes";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FitTrackPage() {
  const { metrics, lastUpdatedDate, incrementMetric, resetToday, resetAllTime, setLastUpdatedDate } =
    useFitTrackStore();
  const { theme, setTheme } = useTheme();

  const [showNewDayDialog, setShowNewDayDialog] = useState(false);
  const [showResetAllDialog, setShowResetAllDialog] = useState(false);
  const [showResetTodayDialog, setShowResetTodayDialog] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Check for new day on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (lastUpdatedDate && lastUpdatedDate !== today) {
      setShowNewDayDialog(true);
    }
  }, [lastUpdatedDate]);

  // Handle Confetti
  const allGoalsMet = useMemo(() => {
    return (
      metrics.calories >= goalMetrics.calories &&
      metrics.protein >= goalMetrics.protein &&
      metrics.waterGlasses >= goalMetrics.waterGlasses &&
      metrics.steps >= goalMetrics.steps &&
      metrics.distanceKm >= goalMetrics.distanceKm
    );
  }, [metrics]);

  useEffect(() => {
    if (allGoalsMet && !hasCelebrated) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF2D55", "#5856D6", "#FF9500", "#34C759"],
      });
      setHasCelebrated(true);
      toast.success("GOALS COMPLETED. SESSION ACHIEVED. ⚡️");
    } else if (!allGoalsMet) {
      setHasCelebrated(false);
    }
  }, [allGoalsMet, hasCelebrated]);

  const handleNewDayReset = (reset: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    if (reset) {
      resetToday();
      toast.info("Data reset. Begin new session.");
    } else {
      setLastUpdatedDate(today);
    }
    setShowNewDayDialog(false);
  };

  const calculateOverallProgress = () => {
    const cal = Math.min(1, metrics.calories / goalMetrics.calories);
    const pro = Math.min(1, metrics.protein / goalMetrics.protein);
    const wat = Math.min(1, metrics.waterGlasses / goalMetrics.waterGlasses);
    const ste = Math.min(1, metrics.steps / goalMetrics.steps);
    const dis = Math.min(1, metrics.distanceKm / goalMetrics.distanceKm);
    return ((cal + pro + wat + ste + dis) / 5) * 100;
  };

  const progress = calculateOverallProgress();
  let greeting = "INITIALIZING...";
  if (progress > 99) greeting = "SESSION OPTIMIZED 🏆";
  else if (progress > 75) greeting = "PEAK PERFORMANCE 💪";
  else if (progress > 50) greeting = "CRITICAL MASS 🚀";
  else if (progress > 25) greeting = "STEADY GAINS 🏃";
  else greeting = "WARMING UP...";

  return (
    <div className="min-h-screen bg-black text-white pb-24 selection:bg-orange-500/20 font-sans tracking-tight">
      {/* Sporty Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-[#1C1C1E]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <Activity className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">FIT_TRACK</h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{format(new Date(), "MMMM dd, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 rounded bg-[#1C1C1E] flex items-center justify-center border border-[#2C2C2E]"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4 text-zinc-500" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* Performance Hero (Yellow Reference Inspired) - Boxier Version */}
        <div className={cn(
          "relative overflow-hidden rounded-sporty p-6 flex flex-col justify-between h-48 transition-all duration-500 border border-orange-500/20 shadow-glow-orange",
          "bg-[#FFB800] text-black"
        )}>
          <div className="flex justify-between items-start">
            <div className="space-y-0">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Performance</h2>
              <p className="text-[10px] font-bold opacity-40">SYSTEM STATUS: {greeting}</p>
            </div>
            <TrendingUp className="h-5 w-5 opacity-60" />
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter">{progress.toFixed(0)}</span>
              <span className="text-2xl font-black opacity-50">%</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Efficiency</p>
              <p className="text-[12px] font-black italic">OPTIMIZED</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            title="Calories"
            emoji="🍽️"
            value={metrics.calories}
            goal={goalMetrics.calories}
            unit="kcal"
            colorClass="text-orange-500"
            glowClass="shadow-glow-orange"
            barColor="bg-orange-500"
            onIncrement={(amount) => incrementMetric("calories", amount)}
            quickAddOptions={[
              { label: "100", amount: 100 },
              { label: "500", amount: 500 },
            ]}
          />

          <MetricCard
            title="Protein"
            emoji="💪"
            value={metrics.protein}
            goal={goalMetrics.protein}
            unit="g"
            colorClass="text-red-500"
            glowClass="shadow-glow-red"
            barColor="bg-red-500"
            onIncrement={(amount) => incrementMetric("protein", amount)}
            quickAddOptions={[
              { label: "20g", amount: 20 },
              { label: "50g", amount: 50 },
            ]}
          />

          <MetricCard
            title="Water"
            emoji="💧"
            value={metrics.waterGlasses}
            goal={goalMetrics.waterGlasses}
            unit="glasses"
            colorClass="text-blue-400"
            glowClass="shadow-glow-blue"
            barColor="bg-blue-400"
            onIncrement={(amount) => incrementMetric("waterGlasses", amount)}
            quickAddOptions={[{ label: "1", amount: 1 }]}
          />

          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Steps"
              emoji="👣"
              value={metrics.steps}
              goal={goalMetrics.steps}
              unit="steps"
              colorClass="text-green-500"
              glowClass="shadow-glow-green"
              barColor="bg-green-500"
              onIncrement={(amount) => incrementMetric("steps", amount)}
              quickAddOptions={[{ label: "500", amount: 500 }]}
            />

            <MetricCard
              title="Distance"
              emoji="🏃‍♀️"
              value={metrics.distanceKm}
              goal={goalMetrics.distanceKm}
              unit="km"
              colorClass="text-purple-500"
              glowClass="shadow-glow-purple"
              barColor="bg-purple-500"
              onIncrement={(amount) => incrementMetric("distanceKm", amount)}
              quickAddOptions={[{ label: "1 km", amount: 1 }]}
            />
          </div>
        </div>

        {/* Global Controls */}
        <div className="pt-8 pb-4 grid grid-cols-2 gap-3">
          <button
            className="bg-[#1C1C1E] border border-[#2C2C2E] text-white h-12 rounded-lg font-black text-[11px] uppercase tracking-widest active:bg-[#2C2C2E] transition-all"
            onClick={() => setShowResetTodayDialog(true)}
          >
            Reset Session
          </button>
          <button
            className="bg-[#1C1C1E] border border-[#2C2C2E] text-red-500 h-12 rounded-lg font-black text-[11px] uppercase tracking-widest active:bg-[#2C2C2E] transition-all"
            onClick={() => setShowResetAllDialog(true)}
          >
            Purge History
          </button>
        </div>
      </main>

      {/* Dialogs */}
      <AlertDialog open={showNewDayDialog} onOpenChange={setShowNewDayDialog}>
        <AlertDialogContent className="rounded-lg border border-[#2C2C2E] bg-[#0B0B0C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic text-xl tracking-tighter">INITIALIZE NEW SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Yesterday's data detected. Reset system for current cycle?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => handleNewDayReset(false)} className="rounded-md h-10 font-bold bg-[#1C1C1E] border-[#2C2C2E] text-white">STANDBY</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleNewDayReset(true)} className="rounded-md h-10 bg-white text-black font-black uppercase tracking-tighter">EXECUTE RESET</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetTodayDialog} onOpenChange={setShowResetTodayDialog}>
        <AlertDialogContent className="rounded-lg border border-[#2C2C2E] bg-[#0B0B0C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic text-xl tracking-tighter text-red-500">ABORT SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Confirming this will clear all active metrics for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-md h-10 font-bold bg-[#1C1C1E] border-[#2C2C2E] text-white">NEGATE</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md h-10 bg-red-500 text-white font-black uppercase tracking-tighter hover:bg-red-600"
              onClick={() => {
                resetToday();
                toast.success("SESSION ABORTED.");
              }}
            >
              CONFIRM ABORT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetAllDialog} onOpenChange={setShowResetAllDialog}>
        <AlertDialogContent className="rounded-lg border border-[#2C2C2E] bg-[#0B0B0C] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic text-xl tracking-tighter text-red-500">SYSTEM PURGE?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Irreversible deletion of all historical logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-md h-10 font-bold bg-[#1C1C1E] border-[#2C2C2E] text-white">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md h-10 bg-red-600 text-white font-black uppercase tracking-tighter"
              onClick={() => {
                resetAllTime();
                toast.success("LOGS PURGED.");
              }}
            >
              CONFIRM PURGE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
