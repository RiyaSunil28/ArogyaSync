import { useSync } from '../context/useSyncContext';
import { Menu, MapPin, Calendar, Clock } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Header = ({ onMenuClick }) => {
  const {
    isOnline,
    toggleConnection,
    currentTime,
    currentDate
  } = useSync();

  return (
    <header className="content-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={18} />
        </button>

        <div className="location-box">
          <MapPin className="location-icon" />
          <div>
            <h2>Primary Health Centre</h2>
            <span className="header-greeting">{getGreeting()}, Dr. Anjali</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="datetime-pill">
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>

        <div className="datetime-pill separator" aria-hidden="true" />

        <div className="datetime-pill">
          <Clock size={14} />
          <span>{currentTime}</span>
        </div>

        <div
          className={`connection-pill ${isOnline ? 'online' : 'offline'}`}
          onClick={toggleConnection}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && toggleConnection()}
          title={isOnline ? 'Click to go offline' : 'Click to go online'}
          aria-label={isOnline ? 'Currently online — click to go offline' : 'Currently offline — click to go online'}
        >
          <span className="pill-dot" />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;