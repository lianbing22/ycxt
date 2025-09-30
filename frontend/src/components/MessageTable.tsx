import { useMemo } from 'react';
import { useDataStore } from '../state/dataStore';

const MessageTable = () => {
  const messages = useDataStore((state) => state.messages);

  const rows = useMemo(
    () =>
      messages.map((message) => (
        <tr key={message.id}>
          <td>{message.id}</td>
          <td>{message.deviceName}</td>
          <td>{message.payload}</td>
          <td>{message.status}</td>
          <td>{new Date(message.timestamp).toLocaleString()}</td>
        </tr>
      )),
    [messages]
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2>实时报文</h2>
        <span className="card-subtitle">来自最新数据通道的消息流</span>
      </div>
      <div className="table-wrapper">
        <table className="message-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>设备</th>
              <th>内容</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
};

export default MessageTable;
