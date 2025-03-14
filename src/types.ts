export interface Zone {
  id: string;
  name: string;
  active: boolean;
  schedule: Schedule[];
  moisture: number; // procenat vlažnosti (0-100)
  moistureHistory: MoistureReading[];
}

export interface Schedule {
  id: string;
  zoneId: string;
  startTime: string;
  duration: number; // in minutes
  days: number[]; // 0-6 for Sunday-Saturday
  active: boolean;
}

export interface WateringSession {
  id: string;
  zoneId: string;
  startTime: Date;
  endTime: Date;
  waterUsage: number; // in liters
  automatic: boolean;
}

export interface MoistureReading {
  timestamp: Date;
  value: number;
}

export interface SystemStatus {
  waterPressure: number; // pritisak vode u barima
  isLowPressure: boolean;
}