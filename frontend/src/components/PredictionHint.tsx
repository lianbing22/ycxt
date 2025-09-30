import { useMemo } from 'react';
import { useDataStore } from '../state/dataStore';

const PredictionHint = () => {
  const insights = useDataStore((state) => state.predictions);

  const topInsight = useMemo(() => insights[0], [insights]);
  const rest = useMemo(() => insights.slice(1), [insights]);

  return (
    <div className="card prediction-card">
      <div className="card-header">
        <h2>智能预测提示</h2>
        <span className="card-subtitle">模型实时检测到的风险事件</span>
      </div>
      {topInsight ? (
        <div className="prediction-card__highlight">
          <strong>{topInsight.title}</strong>
          <p>{topInsight.description}</p>
          <span className="prediction-card__confidence">置信度：{Math.round(topInsight.confidence * 100)}%</span>
        </div>
      ) : (
        <p>暂无风险，系统运行平稳。</p>
      )}
      {rest.length > 0 && (
        <ul className="prediction-card__list">
          {rest.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{Math.round(item.confidence * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PredictionHint;
