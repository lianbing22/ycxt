import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="app-nav">
      <h1 className="app-logo">YCXT 控制面板</h1>
      <div className="app-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          大屏总览
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
          报文监控
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
