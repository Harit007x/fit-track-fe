// Client-side mirror of the backend fitness math (src/utils/fitness.ts on the API).
// Used for a live preview before the profile is saved. The server remains the
// source of truth and returns the same shape on save.

export const ACTIVITY_LEVELS = {
  sedentary: { label: "Sedentary", hint: "Little / no exercise", multiplier: 1.2 },
  light: { label: "Light", hint: "1-3 days / week", multiplier: 1.375 },
  moderate: { label: "Moderate", hint: "3-5 days / week", multiplier: 1.55 },
  active: { label: "Active", hint: "6-7 days / week", multiplier: 1.725 },
  athlete: { label: "Athlete", hint: "Hard daily training", multiplier: 1.9 },
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;
export type Goal = "cut" | "maintain" | "bulk";
export type DietType = "veg" | "non-veg" | "vegan" | "eggetarian";

export interface FitnessComputation {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  idealWeightMinKg: number;
  idealWeightMaxKg: number;
  fitnessLevel: string;
  fitnessScore: number;
}

const round = (n: number, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

export const bmiCategoryOf = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const healthyFatRange = (gender: string): [number, number] =>
  gender === "female" ? [21, 33] : [14, 25];

export interface FitnessInput {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number | null;
  waistCm?: number | null;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export const computeFitness = (input: FitnessInput): FitnessComputation | null => {
  const { gender, age, heightCm, weightKg, activityLevel, goal } = input;
  if (!age || !heightCm || !weightKg || age <= 0 || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiCategory = bmiCategoryOf(bmi);

  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? bmrBase + 5 : bmrBase - 161;

  const multiplier = ACTIVITY_LEVELS[activityLevel]?.multiplier ?? 1.55;
  const tdee = bmr * multiplier;

  let targetCalories = tdee;
  if (goal === "cut") targetCalories = tdee - 500;
  else if (goal === "bulk") targetCalories = tdee + 400;

  const idealWeightMinKg = 18.5 * heightM * heightM;
  const idealWeightMaxKg = 24.9 * heightM * heightM;

  const bmiCenter = 21.7;
  const bmiScore = Math.max(0, 100 - Math.abs(bmi - bmiCenter) * 8);

  let fatScore = bmiScore;
  const hasFat = input.bodyFatPct != null && input.bodyFatPct > 0;
  if (hasFat) {
    const [lo, hi] = healthyFatRange(gender);
    const center = (lo + hi) / 2;
    fatScore = Math.max(0, 100 - Math.abs((input.bodyFatPct as number) - center) * 4);
  }

  let waistScore = bmiScore;
  const hasWaist = input.waistCm != null && input.waistCm > 0;
  if (hasWaist) {
    const whtr = (input.waistCm as number) / heightCm;
    waistScore = Math.max(0, 100 - Math.max(0, whtr - 0.5) * 400);
  }

  const fitnessScore = round(
    hasFat && hasWaist
      ? bmiScore * 0.4 + fatScore * 0.4 + waistScore * 0.2
      : hasFat
        ? bmiScore * 0.5 + fatScore * 0.5
        : hasWaist
          ? bmiScore * 0.6 + waistScore * 0.4
          : bmiScore
  );

  let fitnessLevel = "Needs Work";
  if (fitnessScore >= 85) fitnessLevel = "Athletic";
  else if (fitnessScore >= 70) fitnessLevel = "Fit";
  else if (fitnessScore >= 50) fitnessLevel = "Average";

  return {
    bmi: round(bmi, 1),
    bmiCategory,
    bmr: round(bmr),
    tdee: round(tdee),
    targetCalories: round(targetCalories),
    idealWeightMinKg: round(idealWeightMinKg, 1),
    idealWeightMaxKg: round(idealWeightMaxKg, 1),
    fitnessLevel,
    fitnessScore,
  };
};
