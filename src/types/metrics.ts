export interface Metrics {
  calories: number;
  caloriesBurned: number;
  protein: number;
  waterGlasses: number;
  steps: number;
}

export const defaultMetrics: Metrics = {
  calories: 0,
  caloriesBurned: 0,
  protein: 0,
  waterGlasses: 0,
  steps: 0,
};

// Baseline goals used when the user has not set custom ones.
export const DEFAULT_GOALS: Metrics = {
  calories: 2200,
  caloriesBurned: 500,
  protein: 150,
  waterGlasses: 8,
  steps: 8000,
};

export const GOALS_STORAGE_KEY = "fittrack-goals";

function loadGoalOverrides(): Partial<Metrics> {
  try {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(GOALS_STORAGE_KEY) : null;
    return saved ? (JSON.parse(saved) as Partial<Metrics>) : {};
  } catch {
    return {};
  }
}

/**
 * Live, shared goals object. Hydrated from localStorage on load so it survives
 * reloads, and mutated in place by `setGoalOverrides` so changes made in one
 * route are visible when another route mounts (single module instance in the SPA).
 */
export const goalMetrics: Metrics = { ...DEFAULT_GOALS, ...loadGoalOverrides() };

/** Persist a partial goal override and apply it to the live `goalMetrics` object. */
export function setGoalOverrides(partial: Partial<Metrics>): void {
  const merged = { ...loadGoalOverrides(), ...partial };
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore storage errors */
  }
  Object.assign(goalMetrics, DEFAULT_GOALS, merged);
}

/** Clear custom goals and revert to defaults. */
export function resetGoals(): void {
  try {
    localStorage.removeItem(GOALS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  Object.assign(goalMetrics, DEFAULT_GOALS);
}
