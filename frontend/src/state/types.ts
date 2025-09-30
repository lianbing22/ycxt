export interface Message {
  id: string;
  deviceName: string;
  payload: string;
  status: '正常' | '延迟' | '错误';
  timestamp: number;
}

export type DeviceHealth = 'online' | 'warning' | 'offline';

export interface DeviceStatus {
  id: string;
  name: string;
  health: DeviceHealth;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
  };
  lastHeartbeat: number;
}

export interface PredictionInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
}

export interface TrendPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
}
