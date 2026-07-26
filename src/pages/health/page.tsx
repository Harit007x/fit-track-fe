import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  HeartPulse,
  Ruler,
  Sparkles,
  Loader2,
  Moon,
  Sun,
  Utensils,
  Droplet,
  Download,
  Zap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_LEVELS,
  computeFitness,
  type ActivityLevel,
  type Goal,
  type DietType,
} from "@/lib/fitness";
import { bodyService, type BodyProfile, type DietPlan, type FoodStyle } from "@/services/body.service";
import { downloadDietPlanPdf } from "@/lib/diet-pdf";
import { setGoalOverrides } from "@/types/metrics";
import { loadPresets, savePresets, DIET_PLAN_SOURCE, type QuickPreset } from "@/lib/presets";

type FormState = {
  gender: "male" | "female";
  age: string;
  heightCm: string;
  weightKg: string;
  bodyFatPct: string;
  neckCm: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  bicepsCm: string;
  thighCm: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietType: DietType;
  foodStyle: FoodStyle;
  allergies: string;
};

const EMPTY: FormState = {
  gender: "male",
  age: "",
  heightCm: "",
  weightKg: "",
  bodyFatPct: "",
  neckCm: "",
  chestCm: "",
  waistCm: "",
  hipsCm: "",
  bicepsCm: "",
  thighCm: "",
  activityLevel: "moderate",
  goal: "maintain",
  dietType: "non-veg",
  foodStyle: "accessible",
  allergies: "",
};

const GOALS: { key: Goal; label: string; hint: string }[] = [
  { key: "cut", label: "Cut", hint: "Lose fat" },
  { key: "maintain", label: "Maintain", hint: "Stay lean" },
  { key: "bulk", label: "Bulk", hint: "Gain muscle" },
];

const DIETS: { key: DietType; label: string }[] = [
  { key: "veg", label: "Veg" },
  { key: "non-veg", label: "Non-Veg" },
  { key: "eggetarian", label: "Eggetarian" },
  { key: "vegan", label: "Vegan" },
];

const FOOD_STYLES: { key: FoodStyle; label: string; icon: string; hint: string }[] = [
  { key: "accessible", label: "Everyday", icon: "🛒", hint: "Common, budget-friendly, easy to find" },
  { key: "balanced", label: "Balanced", icon: "⚖️", hint: "Mostly everyday + a few specialty items" },
  { key: "gourmet", label: "Gourmet", icon: "🍽️", hint: "Premium, restaurant-style ingredients" },
];

const num = (s: string): number | undefined => {
  const n = Number(s);
  return s.trim() !== "" && !Number.isNaN(n) && n > 0 ? n : undefined;
};

const mealIcon = (name: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("break")) return "🍳";
  if (n.includes("lunch")) return "🥗";
  if (n.includes("dinner")) return "🍽️";
  if (n.includes("snack")) return "🍎";
  if (n.includes("workout") || n.includes("pre-") || n.includes("post-")) return "💪";
  return "🍴";
};

const isoDay = (d: string | Date) => new Date(d).toISOString().split("T")[0];

// Tracker measures water in glasses; matches the built-in "Big Water Jug" preset
// (3 glasses = 750ml → 250ml per glass).
const ML_PER_GLASS = 250;

const fitnessColor = (level: string) => {
  if (level === "Athletic") return "text-green-500";
  if (level === "Fit") return "text-orange-500";
  if (level === "Average") return "text-yellow-500";
  return "text-red-500";
};

const inputClass =
  "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] font-black text-sm text-zinc-900 dark:text-white h-10 px-3";
const labelClass = "text-[11px] font-bold text-zinc-400 uppercase tracking-wider";

export default function HealthPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [planGeneratedAt, setPlanGeneratedAt] = useState<string | null>(null);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // ---------- Load existing profile ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await bodyService.getProfile();
        if (res.data?.profile) {
          const p = res.data.profile;
          setForm({
            gender: p.gender,
            age: String(p.age ?? ""),
            heightCm: String(p.heightCm ?? ""),
            weightKg: String(p.weightKg ?? ""),
            bodyFatPct: p.bodyFatPct != null ? String(p.bodyFatPct) : "",
            neckCm: p.neckCm != null ? String(p.neckCm) : "",
            chestCm: p.chestCm != null ? String(p.chestCm) : "",
            waistCm: p.waistCm != null ? String(p.waistCm) : "",
            hipsCm: p.hipsCm != null ? String(p.hipsCm) : "",
            bicepsCm: p.bicepsCm != null ? String(p.bicepsCm) : "",
            thighCm: p.thighCm != null ? String(p.thighCm) : "",
            activityLevel: p.activityLevel,
            goal: p.goal,
            dietType: p.dietType,
            foodStyle: p.foodStyle ?? "accessible",
            allergies: p.allergies ?? "",
          });
          setHasSavedProfile(true);
          if (p.dietPlan) setDietPlan(p.dietPlan);
          if (p.planGeneratedAt) setPlanGeneratedAt(p.planGeneratedAt);
        }
      } catch (err) {
        console.error("Failed to load body profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- Live fitness preview ----------
  const fitness = useMemo(
    () =>
      computeFitness({
        gender: form.gender,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        bodyFatPct: num(form.bodyFatPct) ?? null,
        waistCm: num(form.waistCm) ?? null,
        activityLevel: form.activityLevel,
        goal: form.goal,
      }),
    [form]
  );

  const buildPayload = (): BodyProfile => ({
    gender: form.gender,
    age: Number(form.age),
    heightCm: Number(form.heightCm),
    weightKg: Number(form.weightKg),
    bodyFatPct: num(form.bodyFatPct) ?? null,
    neckCm: num(form.neckCm) ?? null,
    chestCm: num(form.chestCm) ?? null,
    waistCm: num(form.waistCm) ?? null,
    hipsCm: num(form.hipsCm) ?? null,
    bicepsCm: num(form.bicepsCm) ?? null,
    thighCm: num(form.thighCm) ?? null,
    activityLevel: form.activityLevel,
    goal: form.goal,
    dietType: form.dietType,
    foodStyle: form.foodStyle,
    allergies: form.allergies.trim() || null,
  });

  const requiredValid = num(form.age) && num(form.heightCm) && num(form.weightKg);
  const generatedToday = planGeneratedAt ? isoDay(planGeneratedAt) === isoDay(new Date()) : false;

  const handleSave = async () => {
    if (!requiredValid) {
      toast.error("Enter your age, height and weight first.");
      return;
    }
    setSaving(true);
    try {
      await bodyService.saveProfile(buildPayload());
      setHasSavedProfile(true);
      toast.success("Body profile saved ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!requiredValid) {
      toast.error("Enter your age, height and weight first.");
      return;
    }
    if (generatedToday) {
      toast.error("Daily limit reached — you can generate one plan per day. Try again tomorrow.");
      return;
    }
    setGenerating(true);
    try {
      // Persist latest inputs so the AI plan reflects what's on screen.
      await bodyService.saveProfile(buildPayload());
      setHasSavedProfile(true);
      const res = await bodyService.generateDietPlan();
      if (res.success && res.data) {
        setDietPlan(res.data.dietPlan);
        setPlanGeneratedAt(res.data.planGeneratedAt);
        toast.success("Diet plan ready 🍽️");
      } else {
        toast.error(res.message || "Failed to generate diet plan.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate diet plan.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyPlan = () => {
    if (!dietPlan) return;
    setApplying(true);
    try {
      // 1) Set tracker daily goals from the plan.
      const waterGlasses = dietPlan.hydrationLiters
        ? Math.round((dietPlan.hydrationLiters * 1000) / ML_PER_GLASS)
        : 0;

      const goals: { calories?: number; protein?: number; waterGlasses?: number } = {};
      if (dietPlan.targetCalories) goals.calories = Math.round(dietPlan.targetCalories);
      if (dietPlan.macros?.proteinG) goals.protein = Math.round(dietPlan.macros.proteinG);
      if (waterGlasses) goals.waterGlasses = waterGlasses;
      setGoalOverrides(goals);

      // 2) Turn each meal into a one-tap Quick-Log preset (replacing any prior
      //    plan-generated presets). Protein is split across meals proportionally
      //    to calories, since the AI only returns day-level macros.
      const totalCal =
        dietPlan.targetCalories ||
        (dietPlan.meals || []).reduce((s, m) => s + (m.calories || 0), 0) ||
        0;
      const dayProtein = dietPlan.macros?.proteinG || 0;

      const mealPresets: QuickPreset[] = (dietPlan.meals || []).map((meal) => {
        const cal = Math.round(meal.calories || 0);
        const protein = totalCal ? Math.round((dayProtein * cal) / totalCal) : 0;
        return {
          source: DIET_PLAN_SOURCE,
          icon: mealIcon(meal.name),
          name: meal.name,
          description: `+${cal} kcal • +${protein}g`,
          updates: { calories: cal, protein },
          color: "border-green-500/30 hover:border-green-500 bg-green-500/5 text-green-500",
        };
      });

      // 3) Add a hydration preset from the plan's recommended water intake.
      const planPresets: QuickPreset[] = [...mealPresets];
      if (waterGlasses) {
        planPresets.push({
          source: DIET_PLAN_SOURCE,
          icon: "💧",
          name: "Hydration",
          description: `+${dietPlan.hydrationLiters} L (${waterGlasses} glasses)`,
          updates: { waterGlasses },
          color: "border-blue-400/30 hover:border-blue-400 bg-blue-400/5 text-blue-400",
        });
      }

      const others = loadPresets().filter((p) => p.source !== DIET_PLAN_SOURCE);
      savePresets([...planPresets, ...others]);

      toast.success("Applied! Tracker goals updated and meals added as presets ⚡", {
        description: "Open the tracker to see your new goals and one-tap meals.",
        action: { label: "Open Tracker", onClick: () => navigate("/tracker") },
      });
    } catch (err) {
      console.error("Apply plan failed:", err);
      toast.error("Could not apply plan to tracker.");
    } finally {
      setApplying(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!dietPlan) return;
    try {
      downloadDietPlanPdf(dietPlan, {
        goal: form.goal,
        dietType: form.dietType,
        foodStyle: form.foodStyle,
        bmi: fitness?.bmi,
        fitnessLevel: fitness?.fitnessLevel,
        weightKg: num(form.weightKg),
        heightCm: num(form.heightCm),
      });
      toast.success("Diet plan downloaded 📄");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Could not generate PDF.");
    }
  };

  const measurementFields: { key: keyof FormState; label: string }[] = [
    { key: "bodyFatPct", label: "Body Fat %" },
    { key: "neckCm", label: "Neck (cm)" },
    { key: "chestCm", label: "Chest (cm)" },
    { key: "waistCm", label: "Waist (cm)" },
    { key: "hipsCm", label: "Hips (cm)" },
    { key: "bicepsCm", label: "Biceps (cm)" },
    { key: "thighCm", label: "Thigh (cm)" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pb-24 font-sans tracking-tight transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-[#1C1C1E]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/tracker")}
            className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] hover:border-orange-500 transition-colors cursor-pointer"
            title="Back to tracker"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">HEALTH_LAB</h1>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                Body Metrics & AI Diet Plan
              </p>
            </div>
          </div>
        </div>
        <button
          className="w-8 h-8 rounded bg-zinc-200 dark:bg-[#1C1C1E] flex items-center justify-center border border-zinc-300 dark:border-[#2C2C2E] cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4 text-zinc-600" />}
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* -------- Left: Inputs -------- */}
            <div className="md:col-span-7 space-y-5">
              {/* Core metrics */}
              <section className="rounded-2xl border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] p-5 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-orange-500" /> Core_Metrics
                </h2>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Gender</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set({ gender: g })}
                        className={cn(
                          "h-10 rounded-md font-black uppercase text-xs tracking-tighter border transition-all cursor-pointer",
                          form.gender === g
                            ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20"
                            : "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-500 hover:border-orange-500"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age / Height / Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Age</Label>
                    <Input type="number" min="1" placeholder="25" value={form.age}
                      onChange={(e) => set({ age: e.target.value })} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Height (cm)</Label>
                    <Input type="number" min="1" placeholder="175" value={form.heightCm}
                      onChange={(e) => set({ heightCm: e.target.value })} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Weight (kg)</Label>
                    <Input type="number" min="1" placeholder="70" value={form.weightKg}
                      onChange={(e) => set({ weightKg: e.target.value })} className={inputClass} />
                  </div>
                </div>

                {/* Activity level */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Activity Level</Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(Object.keys(ACTIVITY_LEVELS) as ActivityLevel[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set({ activityLevel: key })}
                        className={cn(
                          "flex items-center justify-between px-3 h-9 rounded-md border text-left transition-all cursor-pointer",
                          form.activityLevel === key
                            ? "bg-orange-500/10 border-orange-500 text-orange-500"
                            : "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-500 hover:border-orange-500/50"
                        )}
                      >
                        <span className="text-xs font-black uppercase tracking-tighter">{ACTIVITY_LEVELS[key].label}</span>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-tight">{ACTIVITY_LEVELS[key].hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Body measurements */}
              <section className="rounded-2xl border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] p-5 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-orange-500" /> Body_Composition
                  <span className="text-[10px] font-bold text-zinc-400 normal-case tracking-tight">(optional — improves accuracy)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {measurementFields.map((m) => (
                    <div key={m.key} className="space-y-1.5">
                      <Label className={labelClass}>{m.label}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="—"
                        value={form[m.key] as string}
                        onChange={(e) => set({ [m.key]: e.target.value } as Partial<FormState>)}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Diet preferences */}
              <section className="rounded-2xl border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] p-5 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" /> Diet_Preferences
                </h2>

                {/* Goal */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Goal</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => set({ goal: g.key })}
                        className={cn(
                          "flex flex-col items-center justify-center h-14 rounded-md border transition-all cursor-pointer",
                          form.goal === g.key
                            ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20"
                            : "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-500 hover:border-orange-500"
                        )}
                      >
                        <span className="text-xs font-black uppercase tracking-tighter">{g.label}</span>
                        <span className={cn("text-[10px] font-bold", form.goal === g.key ? "text-black/60" : "text-zinc-400")}>{g.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet type */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Diet Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIETS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => set({ dietType: d.key })}
                        className={cn(
                          "h-10 rounded-md font-black uppercase text-[11px] tracking-tighter border transition-all cursor-pointer",
                          form.dietType === d.key
                            ? "bg-orange-500 text-black border-orange-500"
                            : "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-500 hover:border-orange-500"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Allergies / Foods to avoid</Label>
                  <Input
                    placeholder="e.g. peanuts, lactose, shellfish"
                    value={form.allergies}
                    onChange={(e) => set({ allergies: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </section>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile
                </button>
              </div>
            </div>

            {/* -------- Right: Results + Diet plan -------- */}
            <div className="md:col-span-5 space-y-5 md:sticky md:top-24">
              {/* Fitness level */}
              <section className="rounded-2xl border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] p-5 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Fitness_Level
                </h2>

                {fitness ? (
                  <>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Overall Level</p>
                        <p className={cn("text-3xl font-black tracking-tighter", fitnessColor(fitness.fitnessLevel))}>
                          {fitness.fitnessLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Score</p>
                        <p className="text-2xl font-black tracking-tighter">{fitness.fitnessScore}<span className="text-sm text-zinc-400">/100</span></p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-2 rounded-full bg-zinc-200 dark:bg-[#1C1C1E] overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          fitness.fitnessScore >= 85 ? "bg-green-500" : fitness.fitnessScore >= 70 ? "bg-orange-500" : fitness.fitnessScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${fitness.fitnessScore}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl border border-zinc-200 dark:border-[#2C2C2E] bg-zinc-50 dark:bg-[#1C1C1E] p-3">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BMI</p>
                        <p className="text-xl font-black tracking-tighter">{fitness.bmi}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">{fitness.bmiCategory}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 dark:border-[#2C2C2E] bg-zinc-50 dark:bg-[#1C1C1E] p-3">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ideal Weight</p>
                        <p className="text-xl font-black tracking-tighter">{fitness.idealWeightMinKg}–{fitness.idealWeightMaxKg}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">kg (healthy BMI)</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 dark:border-[#2C2C2E] bg-zinc-50 dark:bg-[#1C1C1E] p-3">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Maintenance</p>
                        <p className="text-xl font-black tracking-tighter">{fitness.tdee.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">kcal / day</p>
                      </div>
                      <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Target</p>
                        <p className="text-xl font-black tracking-tighter text-orange-500">{fitness.targetCalories.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">kcal · {form.goal}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight py-6 text-center">
                    Enter age, height & weight to see your fitness level.
                  </p>
                )}
              </section>

              {/* AI Diet plan */}
              <section className="rounded-2xl border border-zinc-200 dark:border-[#2C2C2E] bg-white dark:bg-[#0B0B0C] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-orange-500" /> AI_Diet_Plan
                  </h2>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={!dietPlan}
                    title={dietPlan ? "Download diet plan as PDF" : "Generate a plan first"}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase text-orange-500 bg-orange-500/10 hover:bg-orange-500 hover:text-black px-2 py-1 rounded tracking-widest transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-orange-500/10 disabled:hover:text-orange-500 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>

                {/* Ingredient availability selector */}
                <div className="space-y-1.5">
                  <Label className={labelClass}>Ingredient Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FOOD_STYLES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => set({ foodStyle: s.key })}
                        title={s.hint}
                        className={cn(
                          "flex flex-col items-center justify-center gap-0.5 h-16 rounded-md border transition-all cursor-pointer px-1 text-center",
                          form.foodStyle === s.key
                            ? "bg-orange-500/10 border-orange-500 text-orange-500"
                            : "bg-zinc-100 dark:bg-[#1C1C1E] border-zinc-200 dark:border-[#2C2C2E] text-zinc-500 hover:border-orange-500/50"
                        )}
                      >
                        <span className="text-lg leading-none">{s.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-tighter">{s.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 tracking-tight leading-relaxed">
                    {FOOD_STYLES.find((s) => s.key === form.foodStyle)?.hint}
                  </p>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || !requiredValid || generatedToday}
                  className="w-full h-12 rounded-lg bg-orange-500 text-black font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating…" : dietPlan ? "Regenerate Plan" : "Generate Diet Plan"}
                </button>

                {generatedToday && (
                  <p className="text-[10px] font-bold text-zinc-400 text-center tracking-tight -mt-1">
                    Daily limit reached — you can regenerate tomorrow.
                  </p>
                )}

                {/* Apply plan to the daily tracker */}
                {dietPlan && (
                  <button
                    onClick={handleApplyPlan}
                    disabled={applying}
                    title="Set your tracker goals and add each meal as a one-tap preset"
                    className="w-full h-12 rounded-lg bg-green-500 text-black font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-black" />}
                    Apply to Tracker
                  </button>
                )}

                {dietPlan ? (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">{dietPlan.summary}</p>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="rounded-lg bg-zinc-50 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] p-2 text-center">
                        <p className="text-sm font-black tracking-tighter">{dietPlan.targetCalories}</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">kcal</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] p-2 text-center">
                        <p className="text-sm font-black tracking-tighter text-red-500">{dietPlan.macros?.proteinG}g</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Protein</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] p-2 text-center">
                        <p className="text-sm font-black tracking-tighter text-yellow-500">{dietPlan.macros?.carbsG}g</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Carbs</p>
                      </div>
                      <div className="rounded-lg bg-zinc-50 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] p-2 text-center">
                        <p className="text-sm font-black tracking-tighter text-blue-400">{dietPlan.macros?.fatG}g</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Fat</p>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="space-y-2">
                      {dietPlan.meals?.map((meal, i) => (
                        <div key={i} className="rounded-xl border border-zinc-200 dark:border-[#2C2C2E] overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-[#1C1C1E]">
                            <span className="text-xs font-black uppercase tracking-tighter">{meal.name}</span>
                            <span className="text-[10px] font-black text-orange-500">{meal.calories} kcal</span>
                          </div>
                          <ul className="divide-y divide-zinc-100 dark:divide-[#1C1C1E]">
                            {meal.items?.map((item, j) => (
                              <li key={j} className="flex items-center justify-between px-3 py-1.5">
                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                                  {item.food} <span className="text-zinc-400">· {item.quantity}</span>
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400">{item.calories}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Hydration + tips */}
                    {dietPlan.hydrationLiters ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                        <Droplet className="w-4 h-4" /> Drink ~{dietPlan.hydrationLiters} L water today
                      </div>
                    ) : null}

                    {dietPlan.tips?.length ? (
                      <ul className="space-y-1.5">
                        {dietPlan.tips.map((tip, i) => (
                          <li key={i} className="text-[11px] font-medium text-zinc-500 flex gap-2">
                            <span className="text-orange-500">▸</span> {tip}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed pt-1">
                      AI-generated guidance only — not medical advice. Consult a professional before major diet changes.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight text-center py-4">
                    {hasSavedProfile ? "Generate a plan tailored to your metrics." : "Fill in your metrics, then generate a plan."}
                  </p>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
