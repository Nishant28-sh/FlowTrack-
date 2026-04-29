import { useEffect, useState } from 'react';
import { Trash2, Shield, Search, UserCheck, Users as UsersIcon, Mail, Crown, Activity } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e'];

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function Users() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRF]     = useState('');
  const { user: me } = useAuth();

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid, role) => {
    try {
      await api.patch(`/users/${uid}/role`, { role });
      toast.success(`Role updated to ${role}`);
      setUsers(u => u.map(x => x._id === uid ? { ...x, role } : x));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (uid) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${uid}`);
      toast.success('User deleted');
      setUsers(u => u.filter(x => x._id !== uid));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = users.filter(u =>
    (!roleFilter || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total:   users.length,
    admins:  users.filter(u => u.role === 'admin').length,
    members: users.filter(u => u.role === 'member').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Manage team members, roles, and access control</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Users', value: stats.total,   color: '#818cf8', icon: UsersIcon },
          { label: 'Admins',      value: stats.admins,  color: '#c4b5fd', icon: Crown },
          { label: 'Members',     value: stats.members, color: '#67e8f9', icon: UserCheck },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={15} className="search-icon" />
          <input className="form-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="pill-tabs">
          {[['', 'All'], ['admin', 'Admins'], ['member', 'Members']].map(([v, l]) => (
            <button key={v} className={`pill-tab ${roleFilter === v ? 'active' : ''}`} onClick={() => setRF(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loading"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const isSelf = u._id === me?._id;
                const color  = COLORS[(u.name?.charCodeAt(0) || i) % COLORS.length];
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.8rem', background: `linear-gradient(135deg, ${color}, ${color}bb)`, color: '#fff', boxShadow: `0 2px 10px ${color}44` }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                            {u.name}
                            {isSelf && <span style={{ fontSize: '0.68rem', color: '#818cf8', marginLeft: 6, fontWeight: 700 }}>YOU</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={12} color="#475569" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      {isSelf ? (
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>{u.role}</span>
                      ) : (
                        <select
                          className="form-input"
                          style={{ width: 120, padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      {!isSelf ? (
                        <button className="btn-icon danger" onClick={() => handleDelete(u._id)} title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ color: '#334155', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <UsersIcon size={52} className="empty-state-icon" />
              <p className="empty-state-title">No users found</p>
              <p className="empty-state-desc">Try adjusting your search or filter.</p>
            </div>
          )}

          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              Showing {filtered.length} of {users.length} users
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
