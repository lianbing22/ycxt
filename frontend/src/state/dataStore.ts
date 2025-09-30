let realtimeCleanup: (() => void) | undefined;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { disconnectRealtime, fetchDashboardSnapshot, subscribeRealtime } from '../services/basApi';
import type { DeviceStatus, Message, PredictionInsight, TrendPoint } from './types';

interface DataState {
  loading: boolean;
  messages: Message[];
  devices: DeviceStatus[];
  predictions: PredictionInsight[];
  metricsTrend: TrendPoint[];
  bootstrap: () => Promise<void>;
  teardown: () => void;
}

export const useDataStore = create<DataState>()(
  persist<DataState>(
    (set, get) => ({
      loading: false,
      messages: [],
      devices: [],
      predictions: [],
      metricsTrend: [],
      bootstrap: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const snapshot = await fetchDashboardSnapshot();
          set({
            loading: false,
            messages: snapshot.messages,
            devices: snapshot.devices,
            predictions: snapshot.predictions,
            metricsTrend: snapshot.metricsTrend
          });
          realtimeCleanup?.();
          const cleanup = subscribeRealtime((payload) => {
            set((state) => ({
              messages: [payload.message, ...state.messages].slice(0, 50),
              devices: payload.devices,
              predictions: payload.predictions,
              metricsTrend: [...state.metricsTrend.slice(-19), payload.trendPoint]
            }));
          });
          if (typeof cleanup === 'function') {
            realtimeCleanup = cleanup;
          }
        } catch (error) {
          console.error('Failed to bootstrap data', error);
          set({ loading: false });
        }
      },
      teardown: () => {
        realtimeCleanup?.();
        realtimeCleanup = undefined;
        disconnectRealtime();
        set({ loading: false });
      }
    }),
    {
      name: 'ycxt-data-cache',
      partialize: (state) => ({
        messages: state.messages,
        devices: state.devices,
        predictions: state.predictions,
        metricsTrend: state.metricsTrend
      })
    }
  )
);
