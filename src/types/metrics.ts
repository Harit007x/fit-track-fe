export interface Metrics {
  calories: number;
  protein: number;
  waterGlasses: number;
  steps: number;
  distanceKm: number;
}

export const defaultMetrics: Metrics = {
  calories: 0,
  protein: 0,
  waterGlasses: 0,
  steps: 0,
  distanceKm: 0,
};

export const goalMetrics: Metrics = {
  calories: 2200,
  protein: 150,
  waterGlasses: 8,
  steps: 8000,
  distanceKm: 5,
};
