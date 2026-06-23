import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSync } from '../context/useSyncContext';
import { CheckCircle } from 'lucide-react';

const PAGE_CLASSES = {
  '/patients':      'page-patients',
  '/consultations': 'page-consultations',
  '/prescriptions': 'page-prescriptions',
  '/vaccinations':  'page-vaccinations',
  '/sync-center':   'page-sync',
};

const Layout = ({ onLogout }) => {
  const { toast } = useSync();
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const location = useLocation();

  const toggleSidebarMobile = () => setIsSidebarMobileOpen(prev => !prev);

  useEffect(() => {
    const allPageClasses = Object.values(PAGE_CLASSES);
    document.body.classList.remove(...allPageClasses);
    const pageClass = PAGE_CLASSES[location.pathname];
    if (pageClass) document.body.classList.add(pageClass);
    return () => document.body.classList.remove(...allPageClasses);
  }, [location.pathname]);

  return (
    <div className="app-container">
      <div className={`sidebar ${isSidebarMobileOpen ? 'open' : ''}`}>
        <Sidebar onLogout={onLogout} />
      </div>

      {isSidebarMobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 90, backgroundColor: 'rgba(0,0,0,0.25)' }}
          onClick={toggleSidebarMobile}
        />
      )}

      <div className="main-content">
        <Header onMenuClick={toggleSidebarMobile} />
        <Outlet />
      </div>

      <div className={`toast ${toast.show ? 'show' : ''}`} role="status" aria-live="polite">
        <div className="toast-content">
          <CheckCircle className="toast-icon" size={20} aria-hidden="true" />
          <span className="toast-message">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

export default Layout;