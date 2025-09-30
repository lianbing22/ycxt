import { useEffect } from 'react';
import DeviceStatusCard from '../components/DeviceStatusCard';
import PredictionHint from '../components/PredictionHint';
import VisualizationPanel from '../components/VisualizationPanel';
import { useDataStore } from '../state/dataStore';

const DashboardPage = () => {
  const devices = useDataStore((state) => state.devices);
  const bootstrap = useDataStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <div className="grid dashboard-grid">
      <section className="grid-span-2">
        <VisualizationPanel />
      </section>
      <section className="grid-span-1">
        <PredictionHint />
      </section>
      <section className="grid-span-3 device-grid">
        {devices.map((device) => (
          <DeviceStatusCard key={device.id} device={device} />
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;
