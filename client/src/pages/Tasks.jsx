import { useEffect, useState } from 'react';
import {
  CheckSquare, Calendar, User, Search, Edit,
  AlertTriangle, X, CheckCircle2, Clock, ListFilter,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE    = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', 'Completed': 'badge-completed' };
const PRIORITY_BADGE  = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
const PRIORITY_ICON   = { low: '↓', medium: '→', high: '↑' };

/* ── Status Update Modal ── */
function StatusModal({ task, onClose, onSaved }) {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, { status });
      toast.success('Status updated!');
      onSaved(); onClose();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const opts = [
    { value: 'To Do',       label: 'To Do',       desc: 'Task not started', badge: 'badge-todo' },
    { value: 'In Progress', label: 'In Progress',  desc: 'Currently working', badge: 'badge-inprogress' },
    { value: 'Completed',   label: 'Completed',    desc: 'Task finished', badge: 'badge-completed' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2 className="modal-title">Update Status</h2>
          <button className="btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }} className="truncate-2">{task.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {opts.map(o => (
              <label key={o.value} style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                padding: '0.85rem 1rem', borderRadius: 12, cursor: 'pointer',
                background: status === o.value ? 'rgba(99,102,241,0.1)' : 'var(--surface-3)',
                border: `1px solid ${status === o.value ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="status" value={o.value} checked={status === o.value}
                  onChange={() => setStatus(o.value)} style={{ accentColor: '#6366f1' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{o.label}</p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{o.desc}</p>
                </div>
                <span className={`badge ${o.badge}`}>{o.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Task Row ── */
function TaskRow({ task, isAdmin, onEdit, isOverdue }) {
  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
            background: { 'To Do': '#64748b', 'In Progress': '#f59e0b', 'Completed': '#10b981' }[task.status],
          }} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0',
              textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
              opacity: task.status === 'Completed' ? 0.5 : 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280,
            }}>{task.title}</p>
            {task.description && (
              <p style={{ fontSize: '0.72rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.projectId?.title || '—'}</span></td>
      <td><span className={`badge ${STATUS_BADGE[task.status]}`}>{task.status}</span></td>
      <td>
        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>
          {PRIORITY_ICON[task.priority]} {task.priority}
        </span>
      </td>
      <td>
        {task.dueDate ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: isOverdue(task) ? '#f43f5e' : '#64748b', fontWeight: isOverdue(task) ? 600 : 400 }}>
            {isOverdue(task) && <AlertTriangle size={12} />}
            {fmt(task.dueDate)}
          </span>
        ) : <span style={{ color: '#334155', fontSize: '0.8rem' }}>—</span>}
      </td>
      {isAdmin && (
        <td>
          {task.assignedTo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#fff' }}>
                {task.assignedTo.name?.charAt(0)}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{task.assignedTo.name}</span>
            </div>
          ) : <span style={{ color: '#334155', fontSize: '0.8rem' }}>Unassigned</span>}
        </td>
      )}
      <td>
        <button className="btn-ghost" style={{ fontSize: '0.75rem', gap: '0.3rem' }} onClick={() => onEdit(task)}>
          <Edit size={13} /> Update
        </button>
      </td>
    </tr>
  );
}

export default function Tasks() {
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFS]     = useState('');
  const [filterProject, setFP]    = useState('');
  const [editTask, setEditTask]   = useState(null);
  const { isAdmin } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterProject) params.projectId = filterProject;
      const [tr, pr] = await Promise.all([api.get('/tasks', { params }), api.get('/projects')]);
      setTasks(tr.data.tasks);
      setProjects(pr.data.projects);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterProject]);

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed';

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    overdue:    tasks.filter(isOverdue).length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Tasks</h2>
          <p className="page-subtitle">Track and manage all your assigned tasks</p>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',       value: stats.total,      color: '#818cf8', icon: CheckSquare },
          { label: 'To Do',       value: stats.todo,       color: '#64748b', icon: CheckSquare },
          { label: 'In Progress', value: stats.inProgress, color: '#fbbf24', icon: Clock },
          { label: 'Completed',   value: stats.completed,  color: '#34d399', icon: CheckCircle2 },
          { label: 'Overdue',     value: stats.overdue,    color: '#fb7185', icon: AlertTriangle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={15} className="search-icon" />
          <input className="form-input" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 170 }} value={filterStatus} onChange={e => setFS(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select className="form-input" style={{ width: 200 }} value={filterProject} onChange={e => setFP(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loading"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '3rem' }}>
          <CheckSquare size={56} className="empty-state-icon" />
          <p className="empty-state-title">No tasks found</p>
          <p className="empty-state-desc">{search || filterStatus ? 'Try adjusting your filters.' : 'You have no assigned tasks yet.'}</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th><th>Project</th><th>Status</th>
                  <th>Priority</th><th>Due Date</th>
                  {isAdmin && <th>Assigned To</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => (
                  <TaskRow key={task._id} task={task} isAdmin={isAdmin}
                    onEdit={setEditTask} isOverdue={isOverdue} />
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
              Showing {filtered.length} of {tasks.length} tasks
            </span>
          </div>
        </div>
      )}

      {editTask && <StatusModal task={editTask} onClose={() => setEditTask(null)} onSaved={load} />}
    </div>
  );
}
