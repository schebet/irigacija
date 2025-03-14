import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Zone, Schedule, WateringSession, MoistureReading, SystemStatus } from '../types';

const API_URL = 'http://localhost:3001/api';

// Fallback data for development
const FALLBACK_DATA = {
  zones: [
    {
      id: "zone1",
      name: "Prednja bašta",
      active: false,
      moisture: 65.5,
      schedule: [],
      moistureHistory: [
        {
          timestamp: new Date("2024-03-15T10:00:00Z"),
          value: 65.5
        }
      ]
    },
    {
      id: "zone2",
      name: "Zadnje dvorište",
      active: true,
      moisture: 45.2,
      schedule: [],
      moistureHistory: [
        {
          timestamp: new Date("2024-03-15T10:00:00Z"),
          value: 45.2
        }
      ]
    }
  ],
  systemStatus: {
    waterPressure: 2.5,
    isLowPressure: false
  },
  history: [
    {
      id: "session1",
      zoneId: "zone1",
      startTime: new Date("2024-03-15T06:00:00Z"),
      endTime: new Date("2024-03-15T06:30:00Z"),
      waterUsage: 50.5,
      automatic: true
    }
  ]
};

interface IrrigationState {
  zones: Zone[];
  sessions: WateringSession[];
  activeZones: string[];
  systemStatus: SystemStatus;
  isInitialized: boolean;
  fetchZones: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
  addZone: (zone: Zone) => void;
  toggleZone: (zoneId: string) => Promise<void>;
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (zoneId: string, scheduleId: string) => void;
  addSession: (session: WateringSession) => void;
  updateMoisture: (zoneId: string, value: number) => void;
  updateWaterPressure: (pressure: number) => void;
}

const ensureZoneDefaults = (zone: Partial<Zone>): Zone => ({
  id: zone.id || crypto.randomUUID(),
  name: zone.name || '',
  active: zone.active || false,
  schedule: zone.schedule || [],
  moisture: zone.moisture ?? 0,
  moistureHistory: zone.moistureHistory || []
});

export const useIrrigationStore = create<IrrigationState>()(
  persist(
    (set, get) => ({
      zones: FALLBACK_DATA.zones,
      sessions: FALLBACK_DATA.history,
      activeZones: FALLBACK_DATA.zones.filter(z => z.active).map(z => z.id),
      systemStatus: FALLBACK_DATA.systemStatus,
      isInitialized: false,

      // Fetch zones from API
      fetchZones: async () => {
        if (!get().isInitialized) {
          set({ isInitialized: true });
          return;
        }

        try {
          const response = await fetch(`${API_URL}/zones`);
          if (!response.ok) throw new Error('Network response was not ok');
          const zones = await response.json();
          set({ zones: zones.map(ensureZoneDefaults) });
        } catch (error) {
          console.warn('Using fallback data for zones');
          // Keep existing data instead of resetting to fallback
          if (get().zones.length === 0) {
            set({ zones: FALLBACK_DATA.zones });
          }
        }
      },

      // Fetch history from API
      fetchHistory: async () => {
        if (!get().isInitialized) return;

        try {
          const response = await fetch(`${API_URL}/history`);
          if (!response.ok) throw new Error('Network response was not ok');
          const history = await response.json();
          set({ sessions: history });
        } catch (error) {
          console.warn('Using fallback data for history');
          // Keep existing data instead of resetting to fallback
          if (get().sessions.length === 0) {
            set({ sessions: FALLBACK_DATA.history });
          }
        }
      },

      // Fetch system status from API
      fetchSystemStatus: async () => {
        if (!get().isInitialized) return;

        try {
          const response = await fetch(`${API_URL}/system/status`);
          if (!response.ok) throw new Error('Network response was not ok');
          const status = await response.json();
          set({ 
            systemStatus: {
              waterPressure: status.waterPressure,
              isLowPressure: status.waterPressure < 1.0
            }
          });
        } catch (error) {
          console.warn('Using fallback data for system status');
          // Keep existing status instead of resetting to fallback
          if (!get().systemStatus.waterPressure) {
            set({ systemStatus: FALLBACK_DATA.systemStatus });
          }
        }
      },

      addZone: (zone) =>
        set((state) => ({ 
          zones: [...state.zones, ensureZoneDefaults(zone)]
        })),

      toggleZone: async (zoneId) => {
        try {
          const response = await fetch(`${API_URL}/zones/${zoneId}/toggle`, {
            method: 'POST'
          });
          if (!response.ok) throw new Error('Network response was not ok');
          const result = await response.json();
          
          if (result.success) {
            set((state) => ({
              activeZones: state.activeZones.includes(zoneId)
                ? state.activeZones.filter((id) => id !== zoneId)
                : [...state.activeZones, zoneId],
              zones: state.zones.map((zone) =>
                zone.id === zoneId
                  ? ensureZoneDefaults({ ...zone, active: result.active })
                  : ensureZoneDefaults(zone)
              )
            }));
          }
        } catch (error) {
          console.warn('Falling back to local zone toggle');
          // Fallback: toggle zone locally
          set((state) => ({
            activeZones: state.activeZones.includes(zoneId)
              ? state.activeZones.filter((id) => id !== zoneId)
              : [...state.activeZones, zoneId],
            zones: state.zones.map((zone) =>
              zone.id === zoneId
                ? ensureZoneDefaults({ ...zone, active: !zone.active })
                : ensureZoneDefaults(zone)
            )
          }));
        }
      },

      addSchedule: (schedule) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === schedule.zoneId
              ? ensureZoneDefaults({ ...zone, schedule: [...zone.schedule, schedule] })
              : ensureZoneDefaults(zone)
          ),
        })),

      removeSchedule: (zoneId, scheduleId) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId
              ? ensureZoneDefaults({ 
                  ...zone, 
                  schedule: zone.schedule.filter((s) => s.id !== scheduleId)
                })
              : ensureZoneDefaults(zone)
          ),
        })),

      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      updateMoisture: (zoneId, value) =>
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId
              ? ensureZoneDefaults({
                  ...zone,
                  moisture: value,
                  moistureHistory: [
                    ...(zone.moistureHistory || []),
                    { timestamp: new Date(), value }
                  ].slice(-100)
                })
              : ensureZoneDefaults(zone)
          ),
        })),

      updateWaterPressure: (pressure) =>
        set((state) => ({
          systemStatus: {
            waterPressure: pressure,
            isLowPressure: pressure < 1.0
          }
        })),
    }),
    {
      name: 'irrigation-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.zones = state.zones.map(zone => ensureZoneDefaults(zone));
        }
      }
    }
  )
);