import type { DeviceStatus } from '../state/types';

interface Props {
  device: DeviceStatus;
}

const statusClassMap: Record<DeviceStatus['health'], string> = {
  online: 'status-online',
  warning: 'status-warning',
  offline: 'status-offline'
};

const DeviceStatusCard = ({ device }: Props) => {
  return (
    <div className={`device-card ${statusClassMap[device.health]}`}>
      <header className="device-card__header">
        <h3>{device.name}</h3>
        <span className="device-card__tag">{device.health.toUpperCase()}</span>
      </header>
      <p className="device-card__metric">
        <span>CPU</span>
        <strong>{device.metrics.cpu}%</strong>
      </p>
      <p className="device-card__metric">
        <span>内存</span>
        <strong>{device.metrics.memory}%</strong>
      </p>
      <p className="device-card__metric">
        <span>网络</span>
        <strong>{device.metrics.network} Mbps</strong>
      </p>
      <footer className="device-card__footer">最近心跳：{new Date(device.lastHeartbeat).toLocaleTimeString()}</footer>
    </div>
  );
};

export default DeviceStatusCard;
