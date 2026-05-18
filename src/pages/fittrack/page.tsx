import { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { useFitTrackStore } from "@/hooks/use-fittrack-store";
import { goalMetrics } from "@/types/metrics";
import { MetricCard } from "./components/metric-card";
import { Moon, Sun, TrendingUp, Activity, LogOut, BarChart2, Zap, Plus, Share2, Sparkles, Download, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";


const defaultQuickPresets = [
  {
    icon: "🥤",
    name: "Whey Protein Shake",
    description: "+25g protein • +120 kcal",
    updates: { protein: 25, calories: 120 },
    color: "border-red-500/30 hover:border-red-500 bg-red-500/5 text-red-500",
  },
  {
    icon: "🍛",
    name: "Chicken & Rice",
    description: "+45g protein • +600 kcal",
    updates: { protein: 45, calories: 600 },
    color: "border-orange-500/30 hover:border-orange-500 bg-orange-500/5 text-orange-500",
  },
  {
    icon: "💧",
    name: "Big Water Jug",
    description: "+3 glasses (750ml)",
    updates: { waterGlasses: 3 },
    color: "border-blue-400/30 hover:border-blue-400 bg-blue-400/5 text-blue-400",
  },
  {
    icon: "🏃",
    name: "5K Morning Run",
    description: "+5,000 steps • +5.0 km • +350 kcal",
    updates: { steps: 5000, distanceKm: 5.0, calories: 350 },
    color: "border-green-500/30 hover:border-green-500 bg-green-500/5 text-green-500",
  },
];

const PRESET_THEMES: Record<string, string> = {
  blue: "border-blue-500/30 hover:border-blue-500 bg-blue-500/5 text-blue-500",
  red: "border-red-500/30 hover:border-red-500 bg-red-500/5 text-red-500",
  orange: "border-orange-500/30 hover:border-orange-500 bg-orange-500/5 text-orange-500",
  purple: "border-purple-500/30 hover:border-purple-500 bg-purple-500/5 text-purple-500",
  pink: "border-pink-500/30 hover:border-pink-500 bg-pink-500/5 text-pink-500",
};

const THEME_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const getPresetBadgeStyle = (colorStr: string = "") => {
  if (colorStr.includes("blue")) return "bg-blue-500/10 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white";
  if (colorStr.includes("red")) return "bg-red-500/10 text-red-500 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white";
  if (colorStr.includes("purple")) return "bg-purple-500/10 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white";
  if (colorStr.includes("pink")) return "bg-pink-500/10 text-pink-500 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white";
  if (colorStr.includes("green")) return "bg-green-500/10 text-green-500 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white";
  return "bg-orange-500/10 text-orange-500 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-black";
};


export default function FitTrackPage() {
  const {
    metrics,
    lastUpdatedDate,
    incrementMetric,
    incrementMultipleMetrics,
    resetToday,
    setLastUpdatedDate,
    fetchTodayMetrics
  } = useFitTrackStore();

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [showNewDayDialog, setShowNewDayDialog] = useState(false);
  const [showResetTodayDialog, setShowResetTodayDialog] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Quick Presets State
  const [customPresets, setCustomPresets] = useState<any[]>(() => {
    const saved = localStorage.getItem("fittrack-presets");
    return saved ? JSON.parse(saved) : defaultQuickPresets;
  });
  const [showAddPresetModal, setShowAddPresetModal] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: "",
    icon: "🥤",
    colorTheme: "orange",
    updates: { calories: 0, protein: 0, waterGlasses: 0, steps: 0, distanceKm: 0 } as any,
  });

  // Flex Card Export State
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initial fetch from DB
  useEffect(() => {
    fetchTodayMetrics();
  }, []);

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

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreset.name || !newPreset.icon) return;

    const updates = newPreset.updates;
    let descArr = [];
    if (updates.calories) descArr.push(`+${updates.calories} kcal`);
    if (updates.protein) descArr.push(`+${updates.protein}g`);
    if (updates.waterGlasses) descArr.push(`+${updates.waterGlasses} gl`);
    if (updates.steps) descArr.push(`+${updates.steps} steps`);
    if (updates.distanceKm) descArr.push(`+${updates.distanceKm} km`);
    const description = descArr.join(" • ") || "Custom Routine";

    const created = {
      icon: newPreset.icon,
      name: newPreset.name,
      description,
      updates,
      color: PRESET_THEMES[newPreset.colorTheme] || PRESET_THEMES.orange,
    };

    const updated = [created, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem("fittrack-presets", JSON.stringify(updated));
    toast.success(`Preset "${newPreset.name}" created successfully! ⚡`);
    setShowAddPresetModal(false);
    setNewPreset({ name: "", icon: "🥤", colorTheme: "orange", updates: { calories: 0, protein: 0, waterGlasses: 0, steps: 0, distanceKm: 0 } });
  };

  const handleExportFlexCard = async () => {
    const element = document.getElementById("flex-card-element");
    if (!element) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        style: {
          margin: "0",
          transform: "none",
        },
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `FitTrack_FlexCard_${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Flex Card saved successfully! Ready for Instagram ⚡");
      setShowFlexModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Flex Card");
    } finally {
      setIsExporting(false);
    }
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pb-24 selection:bg-orange-500/20 font-sans tracking-tight transition-colors duration-300">
      {/* Sporty Header */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-[#1C1C1E]">
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
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] hover:border-orange-500 text-orange-500 transition-colors cursor-pointer"
            onClick={() => setShowFlexModal(true)}
            title="Generate Flex Card"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] cursor-pointer"
            onClick={() => navigate("/analytics")}
            title="Analytics Dashboard"
          >
            <BarChart2 className="h-4 w-4 text-orange-500" />
          </button>
          <button
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] cursor-pointer"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4 text-zinc-600" />}
          </button>
          <button
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] text-red-500 cursor-pointer"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">

        {/* Performance Hero (Yellow Reference Inspired) - Boxier Version */}
        <div className={cn(
          "relative overflow-hidden rounded-sporty p-6 flex flex-col justify-between h-48 md:h-56 transition-all duration-500 border border-orange-500/20 shadow-glow-orange",
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
              <span className="text-6xl md:text-7xl font-black tracking-tighter">{progress.toFixed(0)}</span>
              <span className="text-2xl md:text-3xl font-black opacity-50">%</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Efficiency</p>
              <p className="text-[12px] md:text-sm font-black italic">OPTIMIZED</p>
            </div>
          </div>
        </div>

        {/* Responsive Grid for Desktop / Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left Sidebar: Quick Presets & Controls */}
          <div className="md:col-span-5 space-y-6 md:sticky md:top-24">
            {/* Quick Presets Section (Feature 2) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Quick_Log_Presets
                </span>
                <button
                  onClick={() => setShowAddPresetModal(true)}
                  className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer bg-orange-500/10 px-2 py-1 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Custom
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {customPresets.map((preset, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      incrementMultipleMetrics(preset.updates);
                      toast.success(`Logged: ${preset.name} ⚡`);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group active:scale-95 shadow-xs",
                      preset.color || "border-zinc-200 dark:border-zinc-800 hover:border-orange-500 bg-white dark:bg-zinc-900"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl leading-none">{preset.icon}</span>
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-colors",
                          getPresetBadgeStyle(preset.color)
                        )}
                      >
                        LOG ⚡
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-white leading-tight">{preset.name}</h4>
                      <p className="text-[10px] font-bold text-zinc-500 tracking-tighter mt-0.5">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Controls */}
            <div className="pt-2">
              <button
                className="w-full bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white h-12 rounded-lg font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-sm cursor-pointer hover:border-orange-500 transition-colors"
                onClick={() => setShowResetTodayDialog(true)}
              >
                Reset Session
              </button>
            </div>
          </div>

          {/* Right Main Area: Dashboard Metrics Grid */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-orange-500" /> Active_Metrics_Tracker
              </span>
              <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded uppercase">
                Live Session
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                unit="gm"
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
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AlertDialog open={showNewDayDialog} onOpenChange={setShowNewDayDialog}>
        <AlertDialogContent className="rounded-lg border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] text-zinc-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic text-xl tracking-tighter text-zinc-900 dark:text-white">INITIALIZE NEW SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Yesterday's data detected. Reset system for current cycle?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => handleNewDayReset(false)} className="rounded-md h-10 font-bold bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white cursor-pointer">STANDBY</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleNewDayReset(true)} className="rounded-md h-10 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter cursor-pointer">EXECUTE RESET</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetTodayDialog} onOpenChange={setShowResetTodayDialog}>
        <AlertDialogContent className="rounded-lg border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] text-zinc-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic text-xl tracking-tighter text-red-500">ABORT SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Confirming this will clear all active metrics for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-md h-10 font-bold bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white cursor-pointer">NEGATE</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md h-10 bg-red-500 text-white font-black uppercase tracking-tighter hover:bg-red-600 cursor-pointer"
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


      {/* Add Custom Preset Modal */}
      <Dialog open={showAddPresetModal} onOpenChange={setShowAddPresetModal}>
        <DialogContent className="rounded-lg border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] text-zinc-900 dark:text-white max-w-md p-6 shadow-2xl font-sans">
          <DialogHeader className="text-left">
            <DialogTitle className="font-black italic text-xl tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Create_Custom_Preset
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Save your frequent meal, drink, or workout for 1-tap logging.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePreset} className="space-y-4 my-2">
            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Live Preview</Label>
              <div
                className={cn(
                  "p-3.5 rounded-xl border flex flex-col justify-between shadow-xs pointer-events-none",
                  PRESET_THEMES[newPreset.colorTheme] || PRESET_THEMES.orange
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl leading-none">{newPreset.icon || "🥤"}</span>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-colors",
                      getPresetBadgeStyle(newPreset.colorTheme)
                    )}
                  >
                    LOG ⚡
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                    {newPreset.name || "Preset Name"}
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-500 tracking-tighter mt-0.5">
                    {(() => {
                      const updates = newPreset.updates;
                      const arr = [];
                      if (updates.calories) arr.push(`+${updates.calories} kcal`);
                      if (updates.protein) arr.push(`+${updates.protein}g`);
                      if (updates.waterGlasses) arr.push(`+${updates.waterGlasses} gl`);
                      if (updates.steps) arr.push(`+${updates.steps} steps`);
                      if (updates.distanceKm) arr.push(`+${updates.distanceKm} km`);
                      return arr.join(" • ") || "Custom Routine";
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Color Theme</Label>
              <div className="flex items-center gap-3">
                {Object.keys(PRESET_THEMES).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, colorTheme: theme })}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer transition-transform border-2",
                      newPreset.colorTheme === theme ? "scale-110 border-white shadow-lg" : "border-transparent hover:scale-105",
                      THEME_COLORS[theme]
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="preset-name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Preset Name</Label>
                <Input
                  id="preset-name"
                  placeholder="e.g. Post-Workout Shake"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white h-10 px-3"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preset-icon" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Emoji</Label>
                <Input
                  id="preset-icon"
                  placeholder="🥤"
                  value={newPreset.icon}
                  onChange={(e) => setNewPreset({ ...newPreset, icon: e.target.value })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white text-center h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-400 uppercase tracking-wider">Metric Updates</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Calories (+kcal)"
                  type="number"
                  min="0"
                  value={newPreset.updates.calories || ""}
                  onChange={(e) => setNewPreset({ ...newPreset, updates: { ...newPreset.updates, calories: Number(e.target.value) } })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-bold text-xs h-10 px-3"
                />
                <Input
                  placeholder="Protein (+g)"
                  type="number"
                  min="0"
                  value={newPreset.updates.protein || ""}
                  onChange={(e) => setNewPreset({ ...newPreset, updates: { ...newPreset.updates, protein: Number(e.target.value) } })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-bold text-xs h-10 px-3"
                />
                <Input
                  placeholder="Water (+glasses)"
                  type="number"
                  min="0"
                  value={newPreset.updates.waterGlasses || ""}
                  onChange={(e) => setNewPreset({ ...newPreset, updates: { ...newPreset.updates, waterGlasses: Number(e.target.value) } })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-bold text-xs h-10 px-3"
                />
                <Input
                  placeholder="Steps (+steps)"
                  type="number"
                  min="0"
                  value={newPreset.updates.steps || ""}
                  onChange={(e) => setNewPreset({ ...newPreset, updates: { ...newPreset.updates, steps: Number(e.target.value) } })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-bold text-xs h-10 px-3"
                />
                <div className="col-span-2">
                  <Input
                    placeholder="Distance (+km)"
                    type="number"
                    step="0.1"
                    min="0"
                    value={newPreset.updates.distanceKm || ""}
                    onChange={(e) => setNewPreset({ ...newPreset, updates: { ...newPreset.updates, distanceKm: Number(e.target.value) } })}
                    className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-bold text-xs h-10 px-3"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPresetModal(false)}
                className="px-4 py-2.5 rounded-md font-bold bg-zinc-100 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white uppercase text-xs cursor-pointer hover:bg-zinc-200 dark:hover:bg-[#2C2C2E] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-md bg-orange-500 text-black font-black uppercase tracking-tighter text-xs hover:bg-orange-600 active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Save Preset
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Flex Card Modal */}
      <Dialog open={showFlexModal} onOpenChange={setShowFlexModal}>
        <DialogContent className="rounded-lg border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] text-zinc-900 dark:text-white max-w-sm p-6 shadow-2xl font-sans">
          <DialogHeader className="text-left mb-1">
            <DialogTitle className="font-black italic text-xl tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Generate_Flex_Card
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Export an Instagram-ready summary card of your peak performance.
            </DialogDescription>
          </DialogHeader>

          {/* The Flex Card Element */}
          <div className="my-4">
            <div id="flex-card-element" className="p-4 bg-[#09090b] rounded-xl">
              <div
                className="w-full relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white border-2 border-orange-500/50 shadow-glow-orange flex flex-col justify-between min-h-[380px] font-sans tracking-tight"
              >
                {/* Background Glow / Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                {/* Top Bar */}
                <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-black font-black text-xs">
                      ⚡
                    </div>
                    <span className="font-black italic text-base tracking-tighter leading-none">FIT_TRACK</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-500/20 px-2 py-0.5 rounded tracking-widest">PEAK STATUS</span>
                  </div>
                </div>

                {/* Date & Main Metric */}
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter text-orange-500">{metrics.calories.toLocaleString()}</span>
                    <span className="text-xs font-black text-zinc-400 uppercase">/ {goalMetrics.calories} kcal burned</span>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 relative z-10 py-3 border-y border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Protein Burn</p>
                    <p className="text-lg font-black text-red-500">{metrics.protein}g <span className="text-xs font-bold text-zinc-500">/ {goalMetrics.protein}g</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Hydration</p>
                    <p className="text-lg font-black text-blue-400">{metrics.waterGlasses} <span className="text-xs font-bold text-zinc-500">/ {goalMetrics.waterGlasses} gl</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Step Count</p>
                    <p className="text-lg font-black text-green-500">{metrics.steps.toLocaleString()} <span className="text-xs font-bold text-zinc-500">steps</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Distance</p>
                    <p className="text-lg font-black text-purple-500">{metrics.distanceKm.toFixed(1)} <span className="text-xs font-bold text-zinc-500">km</span></p>
                  </div>
                </div>

                {/* Bottom Footer Flex */}
                <div className="flex items-center justify-between relative z-10 text-[10px] font-black uppercase tracking-widest pt-1 text-zinc-400">
                  <span className="text-orange-500 flex items-center gap-1">🔥 7 DAY STREAK</span>
                  <span>VERIFIED ATHLETE</span>
                </div>
              </div>
            </div>
          </div>



          <DialogFooter className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setShowFlexModal(false)}
              className="flex-1 px-4 py-2.5 rounded-md font-bold bg-zinc-100 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white uppercase text-xs hover:bg-zinc-200 dark:hover:bg-[#2C2C2E] cursor-pointer transition-all"
            >
              Close
            </button>
            <button
              onClick={handleExportFlexCard}
              disabled={isExporting}
              className="flex-[2] px-6 py-2.5 rounded-md bg-orange-500 text-black font-black uppercase tracking-tighter text-xs hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Save Instagram Story
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
