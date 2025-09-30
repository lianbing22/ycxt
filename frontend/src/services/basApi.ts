import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { DeviceStatus, Message, PredictionInsight, TrendPoint } from '../state/types';

type SnapshotResponse = {
  messages: Message[];
  devices: DeviceStatus[];
  predictions: PredictionInsight[];
  metricsTrend: TrendPoint[];
};

type RealtimePayload = {
  message: Message;
  devices: DeviceStatus[];
  predictions: PredictionInsight[];
  trendPoint: TrendPoint;
};

let socket: Socket | null = null;

const api = axios.create({
  baseURL: '/api',
  timeout: 10_000
});

const fallbackSnapshot: SnapshotResponse = {
  messages: Array.from({ length: 10 }).map((_, idx) => ({
    id: `MSG-${idx + 1}`,
    deviceName: `传感器-${(idx % 4) + 1}`,
    payload: `温度:${20 + idx}°C 湿度:${50 + idx}%`,
    status: idx % 3 === 0 ? '错误' : idx % 2 === 0 ? '延迟' : '正常',
    timestamp: Date.now() - idx * 60_000
  })),
  devices: Array.from({ length: 6 }).map((_, idx) => ({
    id: `DEV-${idx + 1}`,
    name: `边缘节点-${idx + 1}`,
    health: idx % 4 === 0 ? 'warning' : idx % 5 === 0 ? 'offline' : 'online',
    metrics: {
      cpu: 45 + (idx % 4) * 10,
      memory: 38 + (idx % 5) * 8,
      network: 120 + (idx % 3) * 25
    },
    lastHeartbeat: Date.now() - idx * 25_000
  })),
  predictions: [
    {
      id: 'pred-1',
      title: '冷却水压即将低于阈值',
      description: '冷却水路持续波动，建议检查泵和阀门。',
      confidence: 0.86
    },
    {
      id: 'pred-2',
      title: '风机震动增长',
      description: '近期震动指标上升，需关注轴承磨损。',
      confidence: 0.63
    },
    {
      id: 'pred-3',
      title: '通信延迟偶发',
      description: '局部链路负载偏高，建议优化网络策略。',
      confidence: 0.51
    }
  ],
  metricsTrend: Array.from({ length: 20 }).map((_, idx) => ({
    timestamp: Date.now() - (19 - idx) * 60_000,
    cpu: 40 + Math.sin(idx / 2) * 15,
    memory: 55 + Math.cos(idx / 3) * 8,
    network: 100 + Math.sin(idx / 4) * 30
  }))
};

export async function fetchDashboardSnapshot(): Promise<SnapshotResponse> {
  try {
    const { data } = await api.get<SnapshotResponse>('/dashboard');
    return data;
  } catch (error) {
    console.warn('使用模拟快照数据，因为后端暂不可达。');
    return fallbackSnapshot;
  }
}

export function subscribeRealtime(onData: (payload: RealtimePayload) => void): (() => void) | undefined {
  if (socket) {
    socket.off('dashboard:update');
  }

  try {
    socket = io('/ws', { autoConnect: true });
    socket.on('dashboard:update', onData);
    return () => {
      socket?.off('dashboard:update', onData);
    };
  } catch (error) {
    console.warn('WebSocket 连接失败，启动本地模拟。', error);
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      const trendPoint: TrendPoint = {
        timestamp: Date.now(),
        cpu: 55 + Math.sin(tick / 2) * 10,
        memory: 60 + Math.cos(tick / 3) * 6,
        network: 110 + Math.sin(tick / 4) * 25
      };
      const message: Message = {
        id: `SIM-${Date.now()}`,
        deviceName: `传感器-${(tick % 5) + 1}`,
        payload: `温度:${(Math.random() * 10 + 20).toFixed(1)}°C`,
        status: '正常',
        timestamp: Date.now()
      };
      onData({
        message,
        devices: fallbackSnapshot.devices,
        predictions: fallbackSnapshot.predictions,
        trendPoint
      });
    }, 5_000);

    return () => clearInterval(interval);
  }
  return undefined;
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export async function sendControlCommand(deviceId: string, command: string) {
  await api.post(`/devices/${deviceId}/commands`, { command });
}
