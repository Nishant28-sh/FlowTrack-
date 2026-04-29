import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, AlertTriangle, FolderKanban,
  Users, TrendingUp, ArrowRight, Target, Activity,
  Calendar, Zap, Bell, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── constants ─── */
const STATUS_COLORS = { 'To Do':'#64748b','In Progress':'#f59e0b','Completed':'#10b981' };
const PIE_COLORS    = ['#64748b','#f59e0b','#10b981'];

const CARDS = [
  { key:'totalTasks',      label:'Total Tasks',  icon:CheckSquare, grad:'135deg,#6366f1,#8b5cf6', glow:'rgba(99,102,241,.3)'  },
  { key:'inProgressTasks', label:'In Progress',  icon:Activity,    grad:'135deg,#f59e0b,#fb923c', glow:'rgba(245,158,11,.3)'  },
  { key:'completedTasks',  label:'Completed',    icon:TrendingUp,  grad:'135deg,#10b981,#06b6d4', glow:'rgba(16,185,129,.3)'  },
  { key:'overdueTasks',    label:'Overdue',      icon:AlertTriangle,grad:'135deg,#f43f5e,#f97316',glow:'rgba(244,63,94,.3)'   },
];

/* ─── tooltip ─── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,10,22,.96)', border:'1px solid rgba(99,102,241,.3)', borderRadius:10, padding:'0.65rem 1rem', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
      {label && <p style={{ fontSize:11, color:'#64748b', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>}
      {payload.map((p,i) => <p key={i} style={{ fontSize:13, color:p.color||p.fill||'#e2e8f0', fontWeight:600 }}>{p.name}: <span style={{color:'#f1f5f9'}}>{p.value}</span></p>)}
    </div>
  );
};

/* ─── stat card ─── */
const StatCard = ({ cfg, value, i }) => {
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: i*0.08, type:'spring', stiffness:120 }}
      whileHover={{ y:-6, scale:1.02 }}
      style={{
        position:'relative', overflow:'hidden', padding:'1.5rem',
        borderRadius:18, border:'1px solid rgba(99,102,241,.15)',
        background:'linear-gradient(145deg,rgba(22,22,40,.9),rgba(14,14,28,.9))',
        boxShadow:'0 4px 24px rgba(0,0,0,.35)',
        cursor:'default',
      }}
    >
      {/* top gradient bar */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(${cfg.grad})` }} />
      {/* glow blob */}
      <div style={{ position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:cfg.glow,filter:'blur(30px)',opacity:.5 }} />

      <div style={{ width:48,height:48,borderRadius:14,background:`linear-gradient(${cfg.grad})`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.1rem',boxShadow:`0 6px 20px ${cfg.glow}` }}>
        <Icon size={22} color="#fff" />
      </div>
      <p style={{ fontSize:'2.2rem',fontWeight:900,color:'#f1f5f9',lineHeight:1,letterSpacing:'-0.03em' }}>{value ?? 0}</p>
      <p style={{ fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginTop:6,textTransform:'uppercase',letterSpacing:'0.07em' }}>{cfg.label}</p>

      {/* bg icon */}
      <Icon size={72} style={{ position:'absolute',bottom:-12,right:-12,opacity:.06,color:'#fff',transition:'all .3s' }} />
    </motion.div>
  );
};

/* ─── activity item ─── */
const statusAction = s => s==='Completed'?'completed':'updated';
const ActivityItem = ({ item, i }) => (
  <motion.div
    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
    transition={{ delay:i*0.06 }}
    style={{ display:'flex',gap:'0.75rem',alignItems:'flex-start',padding:'0.65rem 0',borderBottom:'1px solid rgba(99,102,241,.06)' }}
  >
    <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'][i%5]},${['#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e'][i%5]})`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:800,color:'#fff' }}>
      {item.assignedTo?.name?.charAt(0) || item.createdBy?.name?.charAt(0) || '?'}
    </div>
    <div style={{ flex:1,minWidth:0 }}>
      <p style={{ fontSize:'0.8rem',color:'#cbd5e1',lineHeight:1.4 }}>
        <span style={{ fontWeight:700,color:'#e2e8f0' }}>{item.assignedTo?.name || item.createdBy?.name || 'Someone'}</span>
        {' '}{statusAction(item.status)}{' '}
        <span style={{ color:'#818cf8',fontWeight:600 }}>"{item.title}"</span>
      </p>
      <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:3 }}>
        {item.projectId?.title} · {new Date(item.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
      </p>
    </div>
    <span style={{ fontSize:'0.65rem',padding:'0.15rem 0.5rem',borderRadius:99,background:item.status==='Completed'?'rgba(16,185,129,.15)':item.status==='In Progress'?'rgba(245,158,11,.15)':'rgba(100,116,139,.15)',color:STATUS_COLORS[item.status],flexShrink:0,fontWeight:700 }}>
      {item.status}
    </span>
  </motion.div>
);

/* ─── deadline item ─── */
const DeadlineItem = ({ t, i }) => {
  const days = Math.ceil((new Date(t.dueDate)-new Date())/(1000*60*60*24));
  const color = days<=1?'#f43f5e':days<=3?'#f59e0b':'#10b981';
  return (
    <motion.div initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.07 }}
      style={{ display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.65rem 0.85rem',borderRadius:12,background:'rgba(255,255,255,.02)',border:'1px solid rgba(99,102,241,.08)',marginBottom:'0.4rem' }}>
      <div style={{ width:6,height:6,borderRadius:'50%',background:color,boxShadow:`0 0 8px ${color}`,flexShrink:0 }} />
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:'0.82rem',fontWeight:600,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.title}</p>
        <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:1 }}>{t.projectId?.title}</p>
      </div>
      <div style={{ textAlign:'right',flexShrink:0 }}>
        <p style={{ fontSize:'0.75rem',fontWeight:700,color }}>
          {days===0?'Today':days===1?'Tomorrow':`${days}d`}
        </p>
        <p style={{ fontSize:'0.65rem',color:'#475569' }}>
          {new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
        </p>
      </div>
    </motion.div>
  );
};

/* ─── main ─── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',gap:'1rem' }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity,duration:.7,ease:'linear' }}
        style={{ width:44,height:44,borderRadius:'50%',border:'3px solid rgba(99,102,241,.2)',borderTopColor:'#6366f1' }} />
      <p style={{ color:'#475569',fontSize:'0.875rem' }}>Loading dashboard…</p>
    </div>
  );

  const pieData = [
    { name:'To Do',       value: stats?.todoTasks||0 },
    { name:'In Progress', value: stats?.inProgressTasks||0 },
    { name:'Completed',   value: stats?.completedTasks||0 },
  ].filter(d=>d.value>0);

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.completedTasks/stats.totalTasks)*100) : 0;

  const greeting = new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening';

  return (
    <div style={{ maxWidth:1300,margin:'0 auto' }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }}
        style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',marginBottom:'2rem' }}>
        <div>
          <h2 style={{ fontSize:'1.75rem',fontWeight:900,color:'#f1f5f9',letterSpacing:'-0.025em' }}>
            Good {greeting},{' '}
            <span style={{ background:'linear-gradient(135deg,#818cf8,#c4b5fd,#67e8f9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
              {user?.name?.split(' ')[0]}
            </span>{' '}👋
          </h2>
          <p style={{ color:'#475569',marginTop:'0.4rem',fontSize:'0.875rem' }}>
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display:'flex',gap:'0.65rem',flexWrap:'wrap' }}>
          {isAdmin && (
            <Link to="/projects" className="btn-primary" style={{ fontSize:'0.82rem',padding:'0.55rem 1rem' }}>
              <Plus size={15} /> New Project
            </Link>
          )}
          <Link to="/tasks" className="btn-secondary" style={{ fontSize:'0.82rem',padding:'0.55rem 1rem' }}>
            <CheckSquare size={15} /> View Tasks
          </Link>
          {/* Completion badge */}
          <motion.div whileHover={{ scale:1.05 }}
            style={{ display:'flex',alignItems:'center',gap:'0.65rem',padding:'0.55rem 1.1rem',background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',borderRadius:12 }}>
            <Target size={18} color="#10b981" />
            <div>
              <p style={{ fontSize:'1.2rem',fontWeight:900,color:'#10b981',lineHeight:1 }}>{completionRate}%</p>
              <p style={{ fontSize:'0.65rem',color:'#475569',marginTop:1 }}>Completion</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem' }}>
        {CARDS.map((cfg,i) => <StatCard key={cfg.key} cfg={cfg} value={stats?.[cfg.key]} i={i} />)}
      </div>

      {/* ── Row 2: Projects + Users + Weekly Chart ── */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1.8fr',gap:'1rem',marginBottom:'1.5rem' }}>
        {[
          { label:'Projects', value:stats?.totalProjects, icon:FolderKanban, color:'#818cf8', to:'/projects' },
          ...(isAdmin?[{ label:'Team Members', value:stats?.totalUsers, icon:Users, color:'#c4b5fd', to:'/users' }]:[]),
        ].map((s,i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} whileHover={{ y:-4,boxShadow:'0 12px 40px rgba(99,102,241,.2)' }}
              style={{ padding:'1.25rem 1.5rem',borderRadius:16,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)',display:'flex',alignItems:'center',gap:'1rem',transition:'box-shadow .2s' }}>
              <div style={{ width:44,height:44,borderRadius:12,background:`${s.color}18`,border:`1px solid ${s.color}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'1.65rem',fontWeight:900,color:s.color,lineHeight:1 }}>{s.value??0}</p>
                <p style={{ fontSize:'0.75rem',color:'#475569',marginTop:2 }}>{s.label}</p>
              </div>
              <Link to={s.to} className="btn-secondary" style={{ fontSize:'0.72rem',padding:'0.4rem 0.8rem' }}>
                View <ArrowRight size={12} />
              </Link>
            </motion.div>
          );
        })}

        {/* Weekly Area Chart */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.3 }}
          style={{ padding:'1.25rem 1.5rem',borderRadius:16,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)',gridColumn: isAdmin ? 'auto' : '2 / span 2' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <div>
              <p style={{ fontSize:'0.9rem',fontWeight:700,color:'#e2e8f0' }}>Weekly Completions</p>
              <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:2 }}>Tasks completed last 7 days</p>
            </div>
            <Zap size={16} color="#818cf8" />
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={stats?.weeklyChart||[]} margin={{ top:0,right:0,left:-32,bottom:0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'#475569',fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#475569',fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<Tip />}/>
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#wg)" dot={{ fill:'#6366f1',r:3,strokeWidth:0 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Row 3: Donut + Bar Chart ── */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1.7fr',gap:'1.25rem',marginBottom:'1.5rem' }}>
        {/* Donut */}
        <motion.div initial={{ opacity:0,scale:.95 }} animate={{ opacity:1,scale:1 }} transition={{ delay:.2 }}
          whileHover={{ boxShadow:'0 8px 40px rgba(99,102,241,.18)' }}
          style={{ padding:'1.5rem',borderRadius:18,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)',transition:'box-shadow .25s' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
            <div>
              <p style={{ fontSize:'0.9rem',fontWeight:700,color:'#e2e8f0' }}>Status Breakdown</p>
              <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:2 }}>{stats?.totalTasks||0} total tasks</p>
            </div>
          </div>
          {pieData.length>0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip content={<Tip />}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex',flexDirection:'column',gap:'0.45rem',marginTop:'0.75rem' }}>
                {pieData.map((d,i) => {
                  const pct = Math.round((d.value/(stats?.totalTasks||1))*100);
                  return (
                    <div key={d.name} style={{ display:'flex',alignItems:'center',gap:'0.6rem' }}>
                      <div style={{ width:8,height:8,borderRadius:2,background:PIE_COLORS[i],flexShrink:0 }}/>
                      <span style={{ fontSize:'0.78rem',color:'#94a3b8',flex:1 }}>{d.name}</span>
                      <span style={{ fontSize:'0.78rem',fontWeight:700,color:'#e2e8f0' }}>{d.value}</span>
                      <div style={{ width:52,height:5,background:'rgba(99,102,241,.1)',borderRadius:99,overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:.5,duration:.6 }}
                          style={{ height:'100%',background:PIE_COLORS[i],borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:'0.7rem',color:'#475569',width:28,textAlign:'right' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center',padding:'2rem',color:'#334155' }}>
              <Target size={40} style={{ opacity:.2,margin:'0 auto 0.75rem' }}/>
              <p style={{ fontSize:'0.875rem' }}>No tasks yet</p>
            </div>
          )}
        </motion.div>

        {/* Bar chart */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.25 }}
          whileHover={{ boxShadow:'0 8px 40px rgba(99,102,241,.18)' }}
          style={{ padding:'1.5rem',borderRadius:18,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)',transition:'box-shadow .25s' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
            <div>
              <p style={{ fontSize:'0.9rem',fontWeight:700,color:'#e2e8f0' }}>Tasks by Project</p>
              <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:2 }}>Total vs completed</p>
            </div>
          </div>
          {stats?.projectStats?.length>0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats.projectStats} margin={{ top:0,right:0,left:-28,bottom:0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,.06)" vertical={false}/>
                <XAxis dataKey="projectName" tick={{ fill:'#475569',fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v=>v?.length>9?v.slice(0,9)+'…':v}/>
                <YAxis tick={{ fill:'#475569',fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip />} cursor={{ fill:'rgba(99,102,241,.05)' }}/>
                <Bar dataKey="count"     name="Total"     fill="#6366f1" radius={[6,6,0,0]} maxBarSize={36}/>
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6,6,0,0]} maxBarSize={36}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:'center',padding:'3rem 1rem',color:'#334155' }}>
              <FolderKanban size={40} style={{ opacity:.2,margin:'0 auto 0.75rem' }}/>
              <p style={{ fontSize:'0.875rem' }}>No project data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 4: Activity Feed + Upcoming Deadlines ── */}
      <div style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:'1.25rem' }}>

        {/* Activity Feed */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.35 }}
          style={{ padding:'1.5rem',borderRadius:18,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <div>
              <p style={{ fontSize:'0.9rem',fontWeight:700,color:'#e2e8f0' }}>Activity Feed</p>
              <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:2 }}>Recent task updates</p>
            </div>
            <Bell size={15} color="#475569"/>
          </div>
          {stats?.activityFeed?.length>0 ? (
            <div>
              {stats.activityFeed.map((item,i) => <ActivityItem key={item._id} item={item} i={i}/>)}
            </div>
          ) : (
            <div style={{ textAlign:'center',padding:'2.5rem 1rem',color:'#334155' }}>
              <Activity size={40} style={{ opacity:.2,margin:'0 auto 0.75rem' }}/>
              <p style={{ fontSize:'0.875rem' }}>No activity yet</p>
            </div>
          )}
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.4 }}
          style={{ padding:'1.5rem',borderRadius:18,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.14)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <div>
              <p style={{ fontSize:'0.9rem',fontWeight:700,color:'#e2e8f0' }}>Upcoming Deadlines</p>
              <p style={{ fontSize:'0.7rem',color:'#475569',marginTop:2 }}>Next 7 days</p>
            </div>
            <Calendar size={15} color="#475569"/>
          </div>
          {stats?.upcomingDeadlines?.length>0 ? (
            <div>
              {stats.upcomingDeadlines.map((t,i) => <DeadlineItem key={t._id} t={t} i={i}/>)}
            </div>
          ) : (
            <div style={{ textAlign:'center',padding:'2.5rem 1rem',color:'#334155' }}>
              <Calendar size={40} style={{ opacity:.2,margin:'0 auto 0.75rem' }}/>
              <p style={{ fontSize:'0.875rem' }}>No upcoming deadlines 🎉</p>
              <p style={{ fontSize:'0.78rem',color:'#334155',marginTop:4 }}>You're all clear for the week!</p>
            </div>
          )}
          <Link to="/tasks" className="btn-secondary"
            style={{ width:'100%',justifyContent:'center',marginTop:'0.75rem',fontSize:'0.78rem',padding:'0.5rem' }}>
            View All Tasks <ArrowRight size={13}/>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
