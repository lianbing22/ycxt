import { useEffect } from 'react';
import MessageTable from '../components/MessageTable';
import { useDataStore } from '../state/dataStore';

const MessagesPage = () => {
  const bootstrap = useDataStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <div className="messages-page">
      <MessageTable />
    </div>
  );
};

export default MessagesPage;
