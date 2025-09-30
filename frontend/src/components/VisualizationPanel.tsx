import ReactEcharts from 'echarts-for-react';
import { useMemo } from 'react';
import { useDataStore } from '../state/dataStore';

const VisualizationPanel = () => {
  const trend = useDataStore((state) => state.metricsTrend);

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { data: ['CPU', 'Memory', 'Network'], textStyle: { color: '#eee' } },
      grid: { left: 40, right: 20, bottom: 30, top: 40 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trend.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        axisLine: { lineStyle: { color: '#555' } },
        axisLabel: { color: '#aaa' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#aaa' }
      },
      series: [
        {
          name: 'CPU',
          type: 'line',
          areaStyle: {},
          smooth: true,
          data: trend.map((item) => item.cpu)
        },
        {
          name: 'Memory',
          type: 'line',
          smooth: true,
          data: trend.map((item) => item.memory)
        },
        {
          name: 'Network',
          type: 'line',
          smooth: true,
          data: trend.map((item) => item.network)
        }
      ]
    };
  }, [trend]);

  return (
    <div className="card visualization-card">
      <div className="card-header">
        <h2>大屏可视化面板</h2>
        <span className="card-subtitle">关键指标实时曲线</span>
      </div>
      <ReactEcharts option={option} style={{ height: 360 }} notMerge lazyUpdate />
    </div>
  );
};

export default VisualizationPanel;
