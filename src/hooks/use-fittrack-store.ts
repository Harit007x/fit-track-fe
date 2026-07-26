import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { metricService } from '@/services/metric.service';

import { type Metrics, defaultMetrics, goalMetrics } from '@/types/metrics';
export { goalMetrics, type Metrics };

interface FitTrackState {
  metrics: Metrics;
  lastUpdatedDate: string;
  isLoading: boolean;
  fetchTodayMetrics: () => Promise<void>;
  updateMetric: (metric: keyof Metrics, value: number) => void;
  incrementMetric: (metric: keyof Metrics, amount: number) => void;
  incrementMultipleMetrics: (updates: Partial<Metrics>) => void;
  resetToday: () => void;
  resetAllTime: () => void;
  setLastUpdatedDate: (date: string) => void;
}

export const useFitTrackStore = create<FitTrackState>()(
  persist(
    (set, get) => ({
      metrics: { ...defaultMetrics },
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      isLoading: false,

      fetchTodayMetrics: async () => {
        set({ isLoading: true });
        try {
          const response = await metricService.getTodayMetrics();
          if (response.success && response.data) {
            set({ 
              metrics: {
                calories: response.data.calories || 0,
                caloriesBurned: response.data.caloriesBurned || 0,
                protein: response.data.protein || 0,
                waterGlasses: response.data.waterGlasses || 0,
                steps: response.data.steps || 0,
              },
              lastUpdatedDate: response.data.date
            });
          }
        } catch (error) {
          console.error("Error fetching today's metrics:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateMetric: (metric, value) => {
        const today = new Date().toISOString().split('T')[0];
        const newMetrics = {
          ...get().metrics,
          [metric]: Math.max(0, value),
        };
        set({ metrics: newMetrics });
        
        // Sync to backend
        metricService.upsertMetrics(today, { [metric]: Math.max(0, value) });
      },

      incrementMetric: (metric, amount) => {
        const today = new Date().toISOString().split('T')[0];
        const newValue = Math.max(0, get().metrics[metric] + amount);
        const newMetrics = {
          ...get().metrics,
          [metric]: newValue,
        };
        set({ metrics: newMetrics });

        // Sync to backend
        metricService.upsertMetrics(today, { [metric]: newValue });
      },

      incrementMultipleMetrics: (updates) => {
        const today = new Date().toISOString().split('T')[0];
        const current = get().metrics;
        const newMetrics = {
          ...current,
          calories: Math.max(0, current.calories + (updates.calories || 0)),
          caloriesBurned: Math.max(0, current.caloriesBurned + (updates.caloriesBurned || 0)),
          protein: Math.max(0, current.protein + (updates.protein || 0)),
          waterGlasses: Math.max(0, current.waterGlasses + (updates.waterGlasses || 0)),
          steps: Math.max(0, current.steps + (updates.steps || 0)),
        };
        set({ metrics: newMetrics });

        const updatedFields: Partial<Metrics> = {};
        for (const key in updates) {
          const k = key as keyof Metrics;
          updatedFields[k] = newMetrics[k];
        }
        metricService.upsertMetrics(today, updatedFields);
      },

      resetToday: () => {
        const today = new Date().toISOString().split('T')[0];
        set({
          metrics: { ...defaultMetrics },
          lastUpdatedDate: today,
        });
        metricService.upsertMetrics(today, defaultMetrics);
      },

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
