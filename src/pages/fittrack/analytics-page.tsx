import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { useFitTrackStore } from "@/hooks/use-fittrack-store";
import { goalMetrics, type Metrics } from "@/types/metrics";
import { metricService } from "@/services/metric.service";
import { ArrowLeft, Calendar, TrendingUp, Zap, Target, Award, Loader2, Plus, Pencil, History, Share2, Sparkles, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { toPng } from "html-to-image";



export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { metrics } = useFitTrackStore();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "month">("7d");
  const [dbHistory, setDbHistory] = useState<Record<string, Metrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  console.log("loading =", isLoading);
  // Edit / Add Past Day State
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(subDays(new Date(), 1), "yyyy-MM-dd"));
  const [editForm, setEditForm] = useState<Metrics>({
    calories: 0,
    protein: 0,
    waterGlasses: 0,
    steps: 0,
    distanceKm: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flex Card Export State
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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




  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const today = new Date();
      let startDate: string;

      if (timeRange === "7d") {
        startDate = format(subDays(today, 6), "yyyy-MM-dd");
      } else if (timeRange === "30d") {
        startDate = format(subDays(today, 29), "yyyy-MM-dd");
      } else {
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
      }

      try {
        const response = await metricService.getHistory(startDate, format(today, "yyyy-MM-dd"));
        if (response.success && response.data) {
          const historyMap: Record<string, Metrics> = {};
          response.data.forEach((item: any) => {
            historyMap[item.date] = {
              calories: item.calories,
              protein: item.protein,
              waterGlasses: item.waterGlasses,
              steps: item.steps,
              distanceKm: item.distanceKm,
            };
          });
          setDbHistory(historyMap);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [timeRange]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (dbHistory[dateStr]) {
      setEditForm(dbHistory[dateStr]);
    } else {
      setEditForm({ calories: 0, protein: 0, waterGlasses: 0, steps: 0, distanceKm: 0 });
    }
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await metricService.upsertMetrics(selectedDate, editForm);
      if (response.success) {
        setDbHistory((prev) => ({
          ...prev,
          [selectedDate]: editForm,
        }));
        toast.success(`Metrics for ${selectedDate} updated successfully!`);
        setShowEditDialog(false);
      } else {
        toast.error(response.message || "Failed to update metrics");
      }
    } catch (error) {
      console.error("Error updating metrics:", error);
      toast.error("An error occurred while saving metrics");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    if (timeRange === "7d") {
      startDate = subDays(today, 6);
    } else if (timeRange === "30d") {
      startDate = subDays(today, 29);
    } else {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }

    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    return interval.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = dbHistory[dateStr] || (isSameDay(date, today) ? metrics : null);

      return {
        date: format(date, "MMM dd"),
        fullDate: dateStr,
        calories: dayData?.calories || 0,
        protein: dayData?.protein || 0,
        waterGlasses: dayData?.waterGlasses || 0,
        steps: dayData?.steps || 0,
        distanceKm: dayData?.distanceKm || 0,
      };
    });
  }, [dbHistory, metrics, timeRange]);

  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      steps: acc.steps + curr.steps
    }), { calories: 0, steps: 0 });
  }, [chartData]);

  const avgSteps = Math.round(totals.steps / chartData.length);
  const avgCalories = Math.round(totals.calories / chartData.length);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pb-24 font-sans tracking-tight selection:bg-orange-500/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-[#1C1C1E]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tracker")}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-200 dark:border-[#2C2C2E] active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none uppercase">Performance_Insights</h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Analytics Dashboard v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFlexModal(true)}
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] hover:border-orange-500 text-orange-500 transition-colors cursor-pointer"
            title="Generate Flex Card"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
              handleDateSelect(yesterday);
              setShowEditDialog(true);
            }}
            className="px-3 py-1.5 bg-orange-500 text-black font-black text-[10px] uppercase rounded-md tracking-widest hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Past Day
          </button>
          <div className="flex bg-zinc-100 dark:bg-[#1C1C1E] p-1 rounded-lg border border-zinc-200 dark:border-[#2C2C2E]">
            {["7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer",
                  timeRange === range
                    ? "bg-orange-500 text-black shadow-lg"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 relative overflow-hidden group shadow-sm transition-all hover:border-orange-500/50">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="h-16 w-16 text-orange-500" />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Avg Calories</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-orange-500">{avgCalories.toLocaleString()}</span>
              <span className="text-sm font-bold text-zinc-400 uppercase">kcal</span>
            </div>
            <div className="mt-6 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${Math.min(100, (avgCalories / goalMetrics.calories) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 relative overflow-hidden group shadow-sm transition-all hover:border-green-500/50">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Avg Steps</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-green-500">{avgSteps.toLocaleString()}</span>
              <span className="text-sm font-bold text-zinc-400 uppercase">steps</span>
            </div>
            <div className="mt-6 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.min(100, (avgSteps / goalMetrics.steps) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Charts Grid: Calorie Burn Trend & Steps Consistency side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Main Chart: Calorie Burn Trend */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 shadow-sm flex flex-col justify-between h-[360px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Calorie_Burn_Trend
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Daily energy expenditure overview</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">GOAL: {goalMetrics.calories} kcal</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#71717a" }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1c1e",
                      border: "1px solid #2c2c2e",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "900"
                    }}
                    itemStyle={{ color: "#f97316" }}
                    cursor={{ stroke: "#f97316", strokeWidth: 2, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCal)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Steps Distribution Chart */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 shadow-sm flex flex-col justify-between h-[360px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Step_Consistency
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Activity distribution analysis</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#71717a" }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(52, 199, 89, 0.05)' }}
                    contentStyle={{
                      backgroundColor: "#1c1c1e",
                      border: "1px solid #2c2c2e",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "900"
                    }}
                    itemStyle={{ color: "#34c759" }}
                  />
                  <Bar
                    dataKey="steps"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.steps >= goalMetrics.steps ? "#34c759" : "#34c75944"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Past Records / Daily Breakdown List */}
        <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <History className="h-4 w-4 text-purple-500" />
                Daily_Logs_Breakdown
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Review and modify historical logs</p>
            </div>
            <button
              onClick={() => {
                const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
                handleDateSelect(yesterday);
                setShowEditDialog(true);
              }}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-[#2C2C2E] hover:bg-orange-500 hover:text-black text-zinc-900 dark:text-white font-black text-[10px] uppercase rounded-md tracking-widest transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add / Update Record
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-[#2C2C2E] text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Calories</th>
                  <th className="py-3 px-2">Protein</th>
                  <th className="py-3 px-2">Water</th>
                  <th className="py-3 px-2">Steps</th>
                  <th className="py-3 px-2">Distance</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#2C2C2E] font-bold">
                {[...chartData].reverse().map((row) => (
                  <tr key={row.fullDate} className="hover:bg-zinc-50/50 dark:hover:bg-[#252528]/50 transition-colors">
                    <td className="py-3 px-2 font-black flex items-center gap-2 text-zinc-900 dark:text-white">
                      <span>{row.date}</span>
                      {row.fullDate === format(new Date(), "yyyy-MM-dd") && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 font-black tracking-tighter">TODAY</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-orange-500 font-black">{row.calories.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">kcal</span></td>
                    <td className="py-3 px-2 text-red-500 font-black">{row.protein} <span className="text-[10px] text-zinc-500 font-normal">g</span></td>
                    <td className="py-3 px-2 text-blue-400 font-black">{row.waterGlasses} <span className="text-[10px] text-zinc-500 font-normal">gl</span></td>
                    <td className="py-3 px-2 text-green-500 font-black">{row.steps.toLocaleString()}</td>
                    <td className="py-3 px-2 text-purple-500 font-black">{row.distanceKm.toFixed(1)} <span className="text-[10px] text-zinc-500 font-normal">km</span></td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => {
                          handleDateSelect(row.fullDate);
                          setShowEditDialog(true);
                        }}
                        className="p-1.5 rounded bg-zinc-100 dark:bg-[#2C2C2E] hover:bg-orange-500 hover:text-black text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Edit Record"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-sporty p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            Milestones_Unlocked
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[
              { icon: "🔥", label: "7 Day Streak", status: "Active" },
              { icon: "⛰️", label: "Peak Step Day", status: "Unlocked" },
              { icon: "💎", label: "Perfect Month", status: "Progressing" },
              { icon: "🏃", label: "Marathon Distance", status: "Locked" },
            ].map((badge, i) => (
              <div key={i} className="min-w-[120px] flex flex-col items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className={cn("text-3xl mb-2", badge.status === "Locked" && "grayscale opacity-40")}>
                  {badge.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter leading-tight mb-1">{badge.label}</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase">{badge.status}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Past Day Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-lg border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] text-zinc-900 dark:text-white max-w-md p-6 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-black italic text-xl tracking-tighter text-zinc-900 dark:text-white uppercase flex items-center gap-2">
              <Pencil className="w-5 h-5 text-orange-500" />
              Update_Historical_Metrics
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
              Select any past date to log or adjust your session metrics.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMetrics} className="space-y-4 my-2 font-sans">
            <div className="space-y-1.5">
              <Label htmlFor="log-date" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</Label>
              <Input
                id="log-date"
                type="date"
                max={format(new Date(), "yyyy-MM-dd")}
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-orange-500 h-10 px-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-calories" className="text-xs font-bold text-orange-500 uppercase tracking-wider">Calories (kcal)</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  min="0"
                  value={editForm.calories}
                  onChange={(e) => setEditForm({ ...editForm, calories: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-orange-500 h-10 px-3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-protein" className="text-xs font-bold text-red-500 uppercase tracking-wider">Protein (g)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  min="0"
                  value={editForm.protein}
                  onChange={(e) => setEditForm({ ...editForm, protein: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-red-500 h-10 px-3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-water" className="text-xs font-bold text-blue-400 uppercase tracking-wider">Water (glasses)</Label>
                <Input
                  id="edit-water"
                  type="number"
                  min="0"
                  value={editForm.waterGlasses}
                  onChange={(e) => setEditForm({ ...editForm, waterGlasses: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-blue-400 h-10 px-3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-steps" className="text-xs font-bold text-green-500 uppercase tracking-wider">Steps</Label>
                <Input
                  id="edit-steps"
                  type="number"
                  min="0"
                  value={editForm.steps}
                  onChange={(e) => setEditForm({ ...editForm, steps: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-green-500 h-10 px-3"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="edit-distance" className="text-xs font-bold text-purple-500 uppercase tracking-wider">Distance (km)</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  step="0.1"
                  min="0"
                  value={editForm.distanceKm}
                  onChange={(e) => setEditForm({ ...editForm, distanceKm: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white focus-visible:ring-purple-500 h-10 px-3"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditDialog(false)}
                className="px-4 py-2.5 rounded-md font-bold bg-zinc-100 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] text-zinc-900 dark:text-white uppercase text-xs cursor-pointer hover:bg-zinc-200 dark:hover:bg-[#2C2C2E] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md bg-orange-500 text-black font-black uppercase tracking-tighter text-xs hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Metrics
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

