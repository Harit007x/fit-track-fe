import api from "../lib/api";
import type { FitnessComputation, ActivityLevel, Goal, DietType } from "../lib/fitness";

export type FoodStyle = "accessible" | "balanced" | "gourmet";

export interface BodyProfile {
  gender: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number | null;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepsCm?: number | null;
  thighCm?: number | null;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietType: DietType;
  foodStyle: FoodStyle;
  allergies?: string | null;
  dietPlan?: DietPlan | null;
  planGeneratedAt?: string | null;
}

export interface DietPlanMealItem {
  food: string;
  quantity: string;
  calories: number;
}

export interface DietPlanMeal {
  name: string;
  items: DietPlanMealItem[];
  calories: number;
}

export interface DietPlan {
  summary: string;
  targetCalories: number;
  macros: { proteinG: number; carbsG: number; fatG: number };
  meals: DietPlanMeal[];
  hydrationLiters: number;
  tips: string[];
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: { profile: BodyProfile; fitness: FitnessComputation } | null;
}

export interface DietPlanResponse {
  success: boolean;
  message?: string;
  data?: { dietPlan: DietPlan; planGeneratedAt: string; fitness: FitnessComputation };
}

export const bodyService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const res = await api.get<ProfileResponse>("/body");
    return res.data;
  },

  saveProfile: async (payload: BodyProfile): Promise<ProfileResponse> => {
    const res = await api.post<ProfileResponse>("/body", payload);
    return res.data;
  },

  generateDietPlan: async (): Promise<DietPlanResponse> => {
    const res = await api.post<DietPlanResponse>("/body/diet-plan");
    return res.data;
  },
};
