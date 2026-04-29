import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit, ArrowRight,
  FolderKanban, X, Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLOR = { active:'#10b981', completed:'#6366f1', 'on-hold':'#f59e0b' };
const STATUS_BADGE = { active:'badge-active', completed:'badge-completed', 'on-hold':'badge-on-hold' };
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e'];

/* ── Project Modal ── */
function ProjectModal({ project, allUsers, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project?.title||'', description: project?.description||'',
    status: project?.status||'active',
    teamMembers: project?.teamMembers?.map(m=>m._id||m)||[],
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Title is required'); return; }
    setLoading(true);
    try {
      project ? await api.put(`/projects/${project._id}`,form) : await api.post('/projects',form);
      toast.success(project?'Project updated!':'Project created!');
      onSaved(); onClose();
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  const toggle = id => setForm(f=>({...f,teamMembers:f.teamMembers.includes(id)?f.teamMembers.filter(m=>m!==id):[...f.teamMembers,id]}));

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <motion.div className="modal-content" initial={{y:40,opacity:0,scale:.95}} animate={{y:0,opacity:1,scale:1}} exit={{y:40,opacity:0}} transition={{type:'spring',stiffness:140}}>
          <div className="modal-header">
            <h2 className="modal-title">{project?'Edit Project':'New Project'}</h2>
            <button className="btn-icon" onClick={onClose}><X size={17}/></button>
          </div>
          <form onSubmit={submit}>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'0.85rem'}}>
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Project title"/>
                {err&&<p className="form-error">⚠ {err}</p>}
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe this project…"/>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              {allUsers.length>0&&(
                <div>
                  <label className="form-label">Team Members ({form.teamMembers.length} selected)</label>
                  <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                    {allUsers.map((u,i)=>(
                      <label key={u._id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.55rem 0.75rem',borderRadius:10,cursor:'pointer',background:form.teamMembers.includes(u._id)?'rgba(99,102,241,.1)':'transparent',border:`1px solid ${form.teamMembers.includes(u._id)?'rgba(99,102,241,.3)':'transparent'}`,transition:'all .15s'}}>
                        <input type="checkbox" checked={form.teamMembers.includes(u._id)} onChange={()=>toggle(u._id)} style={{accentColor:'#6366f1',width:15,height:15}}/>
                        <div style={{width:26,height:26,borderRadius:'50%',background:AVATAR_COLORS[i%AVATAR_COLORS.length],color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:800,flexShrink:0}}>
                          {u.name?.charAt(0)}
                        </div>
                        <span style={{flex:1,fontSize:'0.85rem',color:'#e2e8f0',fontWeight:500}}>{u.name}</span>
                        <span className={`badge ${u.role==='admin'?'badge-admin':'badge-member'}`}>{u.role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading?<span className="spinner" style={{width:16,height:16,borderWidth:2}}/>:project?'Update':'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Project Card ── */
function ProjectCard({ project, isAdmin, onEdit, onDelete, index }) {
  const progress = project.taskCount>0?Math.round((project.completedCount/project.taskCount)*100):0;
  const sc = STATUS_COLOR[project.status]||'#64748b';

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index*0.07, type:'spring', stiffness:110 }}
      whileHover={{ y:-8, scale:1.015 }}
      style={{
        position:'relative', overflow:'hidden',
        padding:'1.5rem', borderRadius:20,
        background:'linear-gradient(145deg,rgba(24,24,44,.95),rgba(14,14,28,.9))',
        border:'1px solid rgba(99,102,241,.14)',
        boxShadow:'0 4px 24px rgba(0,0,0,.35)',
        display:'flex', flexDirection:'column', gap:'1rem',
        transition:'box-shadow .25s',
        cursor:'default',
      }}
    >
      {/* Top accent line */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${sc},${sc}44)`}}/>
      {/* Glow blob */}
      <div style={{position:'absolute',top:-40,right:-40,width:120,height:120,borderRadius:'50%',background:sc,filter:'blur(50px)',opacity:.06}}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:sc,boxShadow:`0 0 8px ${sc}`,flexShrink:0}}/>
            <span className={`badge ${STATUS_BADGE[project.status]}`}>{project.status}</span>
          </div>
          <h3 style={{fontSize:'1.05rem',fontWeight:800,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.title}</h3>
          <p style={{fontSize:'0.8rem',color:'#475569',marginTop:'0.3rem',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',lineHeight:1.5}}>
            {project.description||'No description provided.'}
          </p>
        </div>
        {isAdmin&&(
          <div style={{display:'flex',gap:'0.3rem',flexShrink:0}}>
            <button className="btn-icon" onClick={()=>onEdit(project)} title="Edit"><Edit size={13}/></button>
            <button className="btn-icon danger" onClick={()=>onDelete(project._id)} title="Delete"><Trash2 size={13}/></button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}>
          <span style={{fontSize:'0.72rem',color:'#475569',fontWeight:600}}>{project.completedCount||0}/{project.taskCount||0} tasks</span>
          <span style={{fontSize:'0.78rem',fontWeight:800,color:progress===100?'#10b981':'#818cf8'}}>{progress}%</span>
        </div>
        <div style={{height:5,background:'rgba(99,102,241,.08)',borderRadius:99,overflow:'hidden'}}>
          <motion.div
            initial={{ width:0 }}
            animate={{ width:`${progress}%` }}
            transition={{ delay:0.5, duration:0.7, ease:'easeOut' }}
            style={{height:'100%',borderRadius:99,background:progress===100?'linear-gradient(90deg,#10b981,#06b6d4)':'linear-gradient(90deg,#6366f1,#8b5cf6)'}}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'0.5rem',borderTop:'1px solid rgba(99,102,241,.07)'}}>
        <div style={{display:'flex',alignItems:'center'}}>
          {project.teamMembers?.slice(0,5).map((m,i)=>(
            <div key={m._id||i} title={m.name} style={{width:26,height:26,borderRadius:'50%',background:AVATAR_COLORS[i%AVATAR_COLORS.length],color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.58rem',fontWeight:800,marginLeft:i>0?-8:0,border:'2px solid rgba(14,14,28,.9)',flexShrink:0}}>
              {m.name?.charAt(0)}
            </div>
          ))}
          {project.teamMembers?.length>5&&(
            <div style={{width:26,height:26,borderRadius:'50%',background:'rgba(99,102,241,.25)',color:'#818cf8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:800,marginLeft:-8,border:'2px solid rgba(14,14,28,.9)'}}>
              +{project.teamMembers.length-5}
            </div>
          )}
          <span style={{fontSize:'0.72rem',color:'#475569',marginLeft:'0.6rem'}}>{project.teamMembers?.length||0} member{project.teamMembers?.length!==1?'s':''}</span>
        </div>
        <Link to={`/projects/${project._id}`} className="btn-primary" style={{fontSize:'0.75rem',padding:'0.4rem 0.85rem'}}>
          Open <ArrowRight size={13}/>
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setSF]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEP]    = useState(null);
  const { isAdmin } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [pr,ur] = await Promise.all([
        api.get('/projects'),
        isAdmin?api.get('/users'):Promise.resolve({data:{users:[]}}),
      ]);
      setProjects(pr.data.projects);
      setAllUsers(ur.data.users||[]);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const handleDelete = async id => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setProjects(p=>p.filter(pr=>pr._id!==id));
    } catch { toast.error('Delete failed'); }
  };

  const filtered = projects.filter(p=>
    (!statusFilter||p.status===statusFilter)&&
    (p.title.toLowerCase().includes(search.toLowerCase())||(p.description||'').toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total:     projects.length,
    active:    projects.filter(p=>p.status==='active').length,
    completed: projects.filter(p=>p.status==='completed').length,
    onHold:    projects.filter(p=>p.status==='on-hold').length,
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'1.75rem',flexWrap:'wrap'}}>
        <div>
          <h2 style={{fontSize:'1.75rem',fontWeight:900,color:'#f1f5f9',letterSpacing:'-0.025em'}}>Projects</h2>
          <p style={{color:'#475569',marginTop:'0.3rem',fontSize:'0.875rem'}}>{projects.length} projects in your workspace</p>
        </div>
        {isAdmin&&(
          <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}}
            className="btn-primary" onClick={()=>{setEP(null);setShowModal(true);}}>
            <Plus size={17}/> New Project
          </motion.button>
        )}
      </motion.div>

      {/* Mini stat strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.875rem',marginBottom:'1.5rem'}}>
        {[
          {label:'Total',    value:stats.total,     color:'#818cf8'},
          {label:'Active',   value:stats.active,    color:'#34d399'},
          {label:'Completed',value:stats.completed, color:'#6366f1'},
          {label:'On Hold',  value:stats.onHold,    color:'#fbbf24'},
        ].map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.07}}
            whileHover={{y:-3,boxShadow:'0 8px 32px rgba(99,102,241,.18)'}}
            style={{padding:'1rem 1.25rem',textAlign:'center',borderRadius:14,background:'rgba(22,22,40,.8)',border:'1px solid rgba(99,102,241,.12)',boxShadow:'0 2px 12px rgba(0,0,0,.25)',transition:'box-shadow .2s'}}>
            <p style={{fontSize:'1.65rem',fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:'0.68rem',color:'#475569',marginTop:4,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.5rem',flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200,maxWidth:360}}>
          <Search size={15} style={{position:'absolute',left:'0.875rem',top:'50%',transform:'translateY(-50%)',color:'#475569'}}/>
          <input className="form-input" style={{paddingLeft:'2.5rem'}} placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:'0.25rem',background:'var(--surface-2)',padding:'0.3rem',borderRadius:12,border:'1px solid var(--border)'}}>
          {['','active','completed','on-hold'].map(s=>(
            <button key={s} onClick={()=>setSF(s)}
              style={{padding:'0.4rem 1rem',borderRadius:8,border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,transition:'all .15s',
                background:statusFilter===s?'#6366f1':'transparent',color:statusFilter===s?'#fff':'#64748b',boxShadow:statusFilter===s?'0 2px 8px rgba(99,102,241,.4)':'none'}}>
              {s?s.charAt(0).toUpperCase()+s.slice(1):'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'40vh'}}>
          <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:.7,ease:'linear'}}
            style={{width:40,height:40,borderRadius:'50%',border:'3px solid rgba(99,102,241,.2)',borderTopColor:'#6366f1'}}/>
        </div>
      ) : filtered.length===0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{textAlign:'center',padding:'5rem 2rem',color:'#334155'}}>
          <FolderKanban size={64} style={{opacity:.15,margin:'0 auto 1.25rem'}}/>
          <p style={{fontSize:'1rem',fontWeight:600,color:'#475569',marginBottom:'0.5rem'}}>
            {search||statusFilter?'No matching projects':'No projects yet'}
          </p>
          {isAdmin&&!search&&!statusFilter&&(
            <button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>setShowModal(true)}>
              <Plus size={16}/> Create First Project
            </button>
          )}
        </motion.div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem'}}>
          <AnimatePresence>
            {filtered.map((p,i)=>(
              <ProjectCard key={p._id} project={p} isAdmin={isAdmin} index={i}
                onEdit={pr=>{setEP(pr);setShowModal(true);}} onDelete={handleDelete}/>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal&&(
        <ProjectModal project={editProject} allUsers={allUsers}
          onClose={()=>setShowModal(false)} onSaved={load}/>
      )}
    </div>
  );
}
