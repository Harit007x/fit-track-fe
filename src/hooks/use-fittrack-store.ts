import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface FitTrackState {
  metrics: Metrics;
  lastUpdatedDate: string;
  updateMetric: (metric: keyof Metrics, value: number) => void;
  incrementMetric: (metric: keyof Metrics, amount: number) => void;
  resetToday: () => void;
  resetAllTime: () => void;
  setLastUpdatedDate: (date: string) => void;
}

export const useFitTrackStore = create<FitTrackState>()(
  persist(
    (set) => ({
      metrics: { ...defaultMetrics },
      lastUpdatedDate: new Date().toISOString().split('T')[0],

      updateMetric: (metric, value) =>
        set((state) => ({
          metrics: {
            ...state.metrics,
            [metric]: Math.max(0, value), // Prevent negative values
          },
        })),

      incrementMetric: (metric, amount) =>
        set((state) => ({
          metrics: {
            ...state.metrics,
            [metric]: Math.max(0, state.metrics[metric] + amount),
          },
        })),

      resetToday: () =>
        set({
          metrics: { ...defaultMetrics },
          lastUpdatedDate: new Date().toISOString().split('T')[0],
        }),

      resetAllTime: () =>
        set({
          metrics: { ...defaultMetrics },
          lastUpdatedDate: new Date().toISOString().split('T')[0],
        }),

      setLastUpdatedDate: (date) =>
        set({
          lastUpdatedDate: date,
        }),
    }),
    {
      name: 'fittrack-storage',
    }
  )
);
