import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
  { to: '/tasks',     icon: CheckSquare,      label: 'My Tasks'  },
];
const ADMIN_NAV = [
  { to: '/users', icon: Users, label: 'Users' },
];

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e'];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColor = COLORS[(user?.name?.charCodeAt(0) || 0) % COLORS.length];

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              FlowTrack
            </p>
            <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 1 }}>Team Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-scroll">
        <p className="sidebar-section-label">Navigation</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={17} />
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={13} style={{ opacity: 0.3 }} />
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="sidebar-section-label" style={{ marginTop: '1rem' }}>Administration</p>
            {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                <ChevronRight size={13} style={{ opacity: 0.3 }} />
              </NavLink>
            ))}
          </>
        )}

        {/* Role chip */}
        <div style={{
          marginTop: '1.5rem', padding: '0.75rem',
          background: 'rgba(99,102,241,0.06)', borderRadius: 12,
          border: '1px solid rgba(99,102,241,0.12)',
        }}>
          <p style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 6 }}>Signed in as</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>{user?.role}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>account</span>
          </div>
        </div>
      </div>

      {/* User footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(99,102,241,0.1)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem',
        }}>
          <div className="avatar" style={{
            width: 36, height: 36, fontSize: '0.8rem',
            background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
            color: '#fff', flexShrink: 0,
          }}>
            {initials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.15)' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
