import { NavLink, useLocation } from 'react-router-dom';
import { useSync } from '../context/useSyncContext';
import { LayoutDashboard, Users, ClipboardList, Pill, Syringe, RefreshCw, Wifi, WifiOff, LogOut } from 'lucide-react';

const navItems = [
  { to:'/',              end:true,  icon:LayoutDashboard, label:'Dashboard',     hint:'Overview & stats' },
  { to:'/patients',      end:false, icon:Users,           label:'Patients',      hint:'Manage records' },
  { to:'/consultations', end:false, icon:ClipboardList,   label:'Consultations', hint:'Visit logs' },
  { to:'/prescriptions', end:false, icon:Pill,            label:'Prescriptions', hint:'Medicine orders' },
  { to:'/vaccinations',  end:false, icon:Syringe,         label:'Vaccinations',  hint:'Dose records' },
  { to:'/sync-center',   end:false, icon:RefreshCw,       label:'Sync Center',   hint:'Upload data' },
];

const Sidebar = ({ onLogout }) => {
  const { isOnline, pendingSync, lastSyncTime, toggleConnection } = useSync();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="logo-box">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" fill="#0d9e6e"/>
            <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="sidebar-brand">
          <h1>ArogyaSync</h1>
          <span className="system-badge">Offline-First System</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-menu" aria-label="Main navigation">
        {navItems.map(({ to, end, icon: Icon, label, hint }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}
            title={hint}
          >
            <Icon size={18} aria-hidden="true"/>
            <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
              <span style={{ lineHeight:1.3 }}>{label}</span>
              <span style={{ fontSize:'10.5px', color: location.pathname===to ? 'rgba(78,203,160,0.7)' : '#4d7089', fontWeight:400, lineHeight:1.2 }}>{hint}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Connection widget */}
      <div
        className={`connection-widget ${isOnline ? 'online' : 'offline'}`}
        onClick={toggleConnection}
        role="button" tabIndex={0}
        onKeyDown={e=>e.key==='Enter'&&toggleConnection()}
        title="Click to toggle connection"
      >
        <div className="widget-header">
          <div className="status-indicator">
            <span className="status-dot"/>
            <span className="status-text">{isOnline ? 'Connected' : 'Offline Mode'}</span>
          </div>
          {isOnline ? <Wifi className="wifi-icon" size={15}/> : <WifiOff className="wifi-icon" size={15}/>}
        </div>
        <div className="widget-body">
          <div className="widget-row">
            <span className="label">Pending upload</span>
            <span className="value badge-count">{pendingSync} records</span>
          </div>
          <div className="widget-row">
            <span className="label">Last synced</span>
            <span className="value time-green">{lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar-wrapper">
            <svg viewBox="0 0 100 100" className="avatar-svg" aria-hidden="true">
              <defs>
                <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2f7cf6"/><stop offset="100%" stopColor="#0d9e6e"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#avatar-grad)"/>
              <path d="M50 30a15 15 0 1 0 0 30 15 15 0 0 0 0-30zM22 80c0-15 12-24 28-24s28 9 28 24H22z" fill="#fff"/>
            </svg>
          </div>
          <div className="user-info">
            <span className="user-name">Dr. Anjali Sharma</span>
            <span className="user-role">Medical Officer</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} aria-label="Log out">
          <LogOut size={15} aria-hidden="true"/><span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;