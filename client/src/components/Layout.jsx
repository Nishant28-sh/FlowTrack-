import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/projects':   'Projects',
  '/tasks':      'My Tasks',
  '/users':      'User Management',
};

export default function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'FlowTrack';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <div style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header className="topbar">
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)' }}>{title}</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 1 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification bell (decorative) */}
            <button className="btn-icon" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: '#f43f5e',
                border: '1.5px solid var(--surface-1)',
              }} />
            </button>

            {/* User chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.4rem 0.85rem 0.4rem 0.5rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 99, cursor: 'default',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 800, color: '#fff',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>
                {user?.name?.split(' ')[0]}
              </span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
