import api from "../lib/api";
import type { Metrics } from "../types/metrics";

export interface MetricResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const metricService = {
  getTodayMetrics: async (): Promise<MetricResponse> => {
    const response = await api.get<MetricResponse>("/metrics/today");
    return response.data;
  },

  upsertMetrics: async (date: string, metrics: Partial<Metrics>): Promise<MetricResponse> => {
    const response = await api.post<MetricResponse>("/metrics", { date, ...metrics });
    return response.data;
  },

  getHistory: async (startDate?: string, endDate?: string): Promise<MetricResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const response = await api.get<MetricResponse>(`/metrics/history?${params.toString()}`);
    return response.data;
  },
};
