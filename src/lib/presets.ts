// Shared Quick-Log preset definitions + localStorage helpers.
// Extracted so both the tracker page and the "Apply diet plan" flow use the
// same source of truth (and defaults aren't wiped when the plan adds presets).

export interface PresetUpdates {
  calories?: number;
  caloriesBurned?: number;
  protein?: number;
  waterGlasses?: number;
  steps?: number;
}

export interface QuickPreset {
  icon: string;
  name: string;
  description: string;
  updates: PresetUpdates;
  color?: string;
  /** Marks presets created by "Apply diet plan" so they can be replaced cleanly. */
  source?: string;
}

export const PRESETS_STORAGE_KEY = "fittrack-presets";
export const DIET_PLAN_SOURCE = "diet-plan";

export const defaultQuickPresets: QuickPreset[] = [
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
    description: "+5,000 steps • +350 kcal burned",
    updates: { steps: 5000, caloriesBurned: 350 },
    color: "border-green-500/30 hover:border-green-500 bg-green-500/5 text-green-500",
  },
];

export function loadPresets(): QuickPreset[] {
  try {
    const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as QuickPreset[]) : [...defaultQuickPresets];
  } catch {
    return [...defaultQuickPresets];
  }
}

export function savePresets(presets: QuickPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    /* ignore storage errors */
  }
}
