import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import { useDataStore } from './state/dataStore';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';

const App = () => {
  const teardown = useDataStore((state) => state.teardown);

  useEffect(() => () => teardown(), [teardown]);

  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-main">
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
