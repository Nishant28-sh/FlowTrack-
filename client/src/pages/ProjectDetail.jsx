import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ArrowLeft, Plus, Trash2, Edit, User, Calendar,
  CheckCircle2, X, LayoutGrid, List, GripVertical,
  Clock, CheckSquare, Target, Activity,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLS   = ['To Do', 'In Progress', 'Completed'];
const PRIORITY_OPTS = ['low', 'medium', 'high'];

const COL_STYLES = {
  'To Do':       { color:'#64748b', bg:'rgba(100,116,139,.08)', border:'rgba(100,116,139,.2)',  dot:'#64748b' },
  'In Progress': { color:'#f59e0b', bg:'rgba(245,158,11,.08)',  border:'rgba(245,158,11,.22)',  dot:'#f59e0b' },
  'Completed':   { color:'#10b981', bg:'rgba(16,185,129,.08)',  border:'rgba(16,185,129,.22)',  dot:'#10b981' },
};
const PRIORITY_COLORS = { low:'#34d399', medium:'#fbbf24', high:'#fb7185' };
const AVATAR_COLORS   = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e'];
const STATUS_BADGE    = { 'To Do':'badge-todo','In Progress':'badge-inprogress','Completed':'badge-completed' };

const fmt = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : null;
const isOverdue = t => t.dueDate && new Date(t.dueDate)<new Date() && t.status!=='Completed';

/* ── Task Modal ── */
function TaskModal({ task, project, allUsers, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    title: task?.title||'', description: task?.description||'',
    assignedTo: task?.assignedTo?._id||task?.assignedTo||'',
    status: task?.status||'To Do', priority: task?.priority||'medium',
    dueDate: task?.dueDate?task.dueDate.split('T')[0]:'', projectId: project._id,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Title is required'); return; }
    setLoading(true);
    try {
      task ? await api.put(`/tasks/${task._id}`,form) : await api.post('/tasks',form);
      toast.success(task?'Task updated!':'Task created!');
      onSaved(); onClose();
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <motion.div className="modal-content" initial={{y:32,opacity:0}} animate={{y:0,opacity:1}} exit={{y:32,opacity:0}} transition={{type:'spring',stiffness:140}}>
          <div className="modal-header">
            <h2 className="modal-title">{task?'Edit Task':'New Task'}</h2>
            <button className="btn-icon" onClick={onClose}><X size={17}/></button>
          </div>
          <form onSubmit={submit}>
            <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'0.85rem'}}>
              {isAdmin && (
                <>
                  <div>
                    <label className="form-label">Title *</label>
                    <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title"/>
                    {err&&<p className="form-error">⚠ {err}</p>}
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Details…"/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                    <div>
                      <label className="form-label">Assign To</label>
                      <select className="form-input" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}>
                        <option value="">Unassigned</option>
                        {allUsers.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Priority</label>
                      <select className="form-input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                        {PRIORITY_OPTS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/>
                  </div>
                </>
              )}
              <div>
                <label className="form-label">Status</label>
                <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                  {STATUS_COLS.map(s=>(
                    <label key={s} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0.9rem',borderRadius:10,cursor:'pointer',background:form.status===s?'rgba(99,102,241,.1)':'var(--surface-3)',border:`1px solid ${form.status===s?'rgba(99,102,241,.35)':'transparent'}`,transition:'all .15s'}}>
                      <input type="radio" name="status" value={s} checked={form.status===s} onChange={()=>setForm({...form,status:s})} style={{accentColor:'#6366f1'}}/>
                      <div style={{width:8,height:8,borderRadius:'50%',background:COL_STYLES[s].dot}}/>
                      <span style={{flex:1,fontSize:'0.875rem',fontWeight:500,color:'#e2e8f0'}}>{s}</span>
                      <span className={`badge ${STATUS_BADGE[s]}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading?<span className="spinner" style={{width:16,height:16,borderWidth:2}}/>:task?'Update Task':'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Kanban Task Card ── */
function KanbanCard({ task, index, isAdmin, onEdit, onDelete }) {
  const od = isOverdue(task);
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom:'0.6rem',
          }}
        >
          <motion.div
            whileHover={{ y:-2, boxShadow:'0 8px 32px rgba(99,102,241,.22)' }}
            style={{
              background: snapshot.isDragging ? 'rgba(30,30,52,0.98)' : 'rgba(22,22,40,.9)',
              border:`1px solid ${snapshot.isDragging?'rgba(99,102,241,.5)':'rgba(99,102,241,.12)'}`,
              borderRadius:14,
              padding:'1rem 1.1rem',
              boxShadow: snapshot.isDragging ? '0 20px 60px rgba(0,0,0,.5),0 0 30px rgba(99,102,241,.3)' : '0 2px 12px rgba(0,0,0,.25)',
              cursor:'grab',
              transition:'border-color .15s, box-shadow .15s',
            }}
          >
            {/* Drag handle + actions */}
            <div style={{display:'flex',alignItems:'flex-start',gap:'0.5rem',marginBottom:'0.6rem'}}>
              <div {...provided.dragHandleProps} style={{color:'#334155',cursor:'grab',marginTop:2,flexShrink:0}}>
                <GripVertical size={14}/>
              </div>
              <p style={{flex:1,fontSize:'0.875rem',fontWeight:600,color:'#e2e8f0',lineHeight:1.4}}>{task.title}</p>
              <div style={{display:'flex',gap:'0.25rem',flexShrink:0}}>
                <button className="btn-icon" style={{width:26,height:26}} onClick={()=>onEdit(task)}><Edit size={12}/></button>
                {isAdmin&&<button className="btn-icon danger" style={{width:26,height:26}} onClick={()=>onDelete(task._id)}><Trash2 size={12}/></button>}
              </div>
            </div>

            {/* Description */}
            {task.description&&(
              <p style={{fontSize:'0.75rem',color:'#475569',marginBottom:'0.6rem',lineHeight:1.5,paddingLeft:20,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                {task.description}
              </p>
            )}

            {/* Badges */}
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap',paddingLeft:20,marginBottom:'0.6rem'}}>
              <span style={{fontSize:'0.65rem',padding:'0.15rem 0.5rem',borderRadius:99,background:`${PRIORITY_COLORS[task.priority]}18`,color:PRIORITY_COLORS[task.priority],border:`1px solid ${PRIORITY_COLORS[task.priority]}30`,fontWeight:700}}>
                {task.priority}
              </span>
              {od&&<span className="badge badge-overdue" style={{fontSize:'0.62rem'}}>Overdue</span>}
            </div>

            {/* Footer */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingLeft:20}}>
              {task.assignedTo?(
                <div style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:800,color:'#fff'}}>
                    {task.assignedTo.name?.charAt(0)}
                  </div>
                  <span style={{fontSize:'0.72rem',color:'#64748b'}}>{task.assignedTo.name}</span>
                </div>
              ):<span style={{fontSize:'0.72rem',color:'#334155'}}>Unassigned</span>}
              {task.dueDate&&(
                <span style={{display:'flex',alignItems:'center',gap:'0.25rem',fontSize:'0.7rem',color:od?'#f43f5e':'#475569',fontWeight:od?700:400}}>
                  <Calendar size={11}/>{fmt(task.dueDate)}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}

/* ── Kanban Column ── */
function KanbanColumn({ status, tasks, isAdmin, onEdit, onDelete, onAdd }) {
  const style = COL_STYLES[status];
  const icons = { 'To Do':Clock,'In Progress':Activity,'Completed':CheckCircle2 };
  const Icon = icons[status]||CheckSquare;

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:0}}>
      {/* Column header */}
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.875rem',padding:'0.65rem 0.9rem',borderRadius:12,background:style.bg,border:`1px solid ${style.border}`}}>
        <Icon size={15} color={style.color}/>
        <span style={{flex:1,fontSize:'0.85rem',fontWeight:700,color:style.color}}>{status}</span>
        <span style={{fontSize:'0.72rem',fontWeight:800,color:style.color,background:`${style.color}20`,padding:'0.15rem 0.55rem',borderRadius:99}}>
          {tasks.length}
        </span>
        {isAdmin&&status==='To Do'&&(
          <button onClick={onAdd} style={{background:'none',border:'none',cursor:'pointer',color:style.color,display:'flex',padding:0}}>
            <Plus size={15}/>
          </button>
        )}
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex:1,minHeight:120,
              padding:'0.5rem',
              borderRadius:14,
              background:snapshot.isDraggingOver?`${style.color}08`:'transparent',
              border:`2px dashed ${snapshot.isDraggingOver?style.border:'transparent'}`,
              transition:'all .2s',
            }}
          >
            <AnimatePresence>
              {tasks.map((task,i)=>(
                <motion.div key={task._id}
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,scale:.9}} transition={{delay:i*.04}}>
                  <KanbanCard task={task} index={i} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete}/>
                </motion.div>
              ))}
            </AnimatePresence>
            {provided.placeholder}
            {tasks.length===0&&!snapshot.isDraggingOver&&(
              <div style={{textAlign:'center',padding:'2rem 1rem',color:'#334155'}}>
                <CheckSquare size={28} style={{opacity:.2,margin:'0 auto 0.5rem'}}/>
                <p style={{fontSize:'0.75rem'}}>Drop tasks here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* ── Main ── */
export default function ProjectDetail() {
  const { id }  = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  const load = async () => {
    try {
      const [pr,tr,ur] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        isAdmin?api.get('/users'):Promise.resolve({data:{users:[]}}),
      ]);
      setProject(pr.data.project);
      setTasks(tr.data.tasks);
      setAllUsers(ur.data.users||[]);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[id]);

  /* ── Drag end ── */
  const onDragEnd = async result => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId===source.droppableId && destination.index===source.index) return;

    const newStatus = destination.droppableId;
    // Optimistic update
    setTasks(prev => prev.map(t => t._id===draggableId ? {...t, status:newStatus} : t));
    try {
      await api.put(`/tasks/${draggableId}`, { status:newStatus });
      toast.success(`Moved → ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
      load(); // revert
    }
  };

  const handleDelete = async tid => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${tid}`);
      toast.success('Task deleted');
      setTasks(t=>t.filter(tk=>tk._id!==tid));
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:.7,ease:'linear'}}
        style={{width:44,height:44,borderRadius:'50%',border:'3px solid rgba(99,102,241,.2)',borderTopColor:'#6366f1'}}/>
    </div>
  );
  if (!project) return <div style={{color:'#475569',padding:'3rem',textAlign:'center'}}>Project not found.</div>;

  const tasksByStatus = STATUS_COLS.reduce((a,s)=>({...a,[s]:tasks.filter(t=>t.status===s)}),{});
  const progress = tasks.length>0 ? Math.round((tasksByStatus['Completed'].length/tasks.length)*100) : 0;

  return (
    <div>
      {/* Back */}
      <Link to="/projects" style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',color:'#475569',textDecoration:'none',fontSize:'0.85rem',marginBottom:'1.5rem',transition:'color .15s'}}
        onMouseEnter={e=>e.currentTarget.style.color='#818cf8'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>
        <ArrowLeft size={15}/> Back to Projects
      </Link>

      {/* Project header */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
        style={{padding:'1.75rem',borderRadius:20,background:'rgba(22,22,40,.85)',border:'1px solid rgba(99,102,241,.16)',marginBottom:'1.5rem',boxShadow:'0 4px 24px rgba(0,0,0,.3)'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
              <span className={`badge badge-${project.status==='active'?'active':project.status==='completed'?'completed':'on-hold'}`}>{project.status}</span>
            </div>
            <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'#f1f5f9',letterSpacing:'-0.02em'}}>{project.title}</h2>
            {project.description&&<p style={{color:'#64748b',marginTop:'0.5rem',fontSize:'0.875rem',lineHeight:1.6}}>{project.description}</p>}
          </div>
          <div style={{display:'flex',gap:'0.65rem',flexShrink:0,flexWrap:'wrap'}}>
            {/* View toggle */}
            <div style={{display:'flex',gap:'0.25rem',background:'var(--surface-3)',padding:'0.25rem',borderRadius:10,border:'1px solid var(--border)'}}>
              {[['kanban',LayoutGrid,'Kanban'],['list',List,'List']].map(([v,Icon,label])=>(
                <button key={v} onClick={()=>setViewMode(v)}
                  style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.4rem 0.75rem',borderRadius:8,border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,transition:'all .15s',
                    background:viewMode===v?'#6366f1':'transparent',color:viewMode===v?'#fff':'#64748b'}}>
                  <Icon size={14}/>{label}
                </button>
              ))}
            </div>
            {isAdmin&&(
              <button className="btn-primary" onClick={()=>{setEditTask(null);setShowModal(true);}}>
                <Plus size={16}/> Add Task
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{marginTop:'1.25rem',paddingTop:'1.25rem',borderTop:'1px solid rgba(99,102,241,.1)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.45rem'}}>
            <div style={{display:'flex',gap:'1.5rem'}}>
              {STATUS_COLS.map(s=>(
                <span key={s} style={{fontSize:'0.75rem',color:'#475569',display:'flex',alignItems:'center',gap:'0.35rem'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:COL_STYLES[s].dot,display:'inline-block'}}/>
                  {tasksByStatus[s].length} {s}
                </span>
              ))}
            </div>
            <span style={{fontSize:'0.875rem',fontWeight:800,color:progress===100?'#10b981':'#818cf8'}}>{progress}%</span>
          </div>
          <div style={{height:8,background:'rgba(99,102,241,.08)',borderRadius:99,overflow:'hidden'}}>
            <motion.div initial={{width:0}} animate={{width:`${progress}%`}} transition={{delay:.3,duration:.7,ease:'easeOut'}}
              style={{height:'100%',borderRadius:99,background:progress===100?'linear-gradient(90deg,#10b981,#06b6d4)':'linear-gradient(90deg,#6366f1,#8b5cf6)'}}/>
          </div>
        </div>

        {/* Team */}
        {project.teamMembers?.length>0&&(
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginTop:'1rem',flexWrap:'wrap'}}>
            <span style={{fontSize:'0.7rem',color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Team:</span>
            {project.teamMembers.map((m,i)=>(
              <div key={m._id} style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.2rem 0.65rem 0.2rem 0.3rem',background:'rgba(99,102,241,.08)',borderRadius:99,border:'1px solid rgba(99,102,241,.16)'}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:AVATAR_COLORS[i%AVATAR_COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:800,color:'#fff'}}>
                  {m.name?.charAt(0)}
                </div>
                <span style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:500}}>{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Kanban / List View ── */}
      {viewMode==='kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem',alignItems:'start'}}>
            {STATUS_COLS.map(status=>(
              <motion.div key={status} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:STATUS_COLS.indexOf(status)*.1}}>
                <KanbanColumn
                  status={status} tasks={tasksByStatus[status]}
                  isAdmin={isAdmin}
                  onEdit={t=>{setEditTask(t);setShowModal(true);}}
                  onDelete={handleDelete}
                  onAdd={()=>{setEditTask(null);setShowModal(true);}}
                />
              </motion.div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        /* List view */
        <div>
          {tasks.length===0?(
            <div style={{textAlign:'center',padding:'4rem 2rem',color:'#334155'}}>
              <CheckSquare size={52} style={{opacity:.2,margin:'0 auto 1rem'}}/>
              <p style={{fontSize:'1rem',fontWeight:600,color:'#475569'}}>No tasks yet</p>
              {isAdmin&&<button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>setShowModal(true)}><Plus size={16}/>Create First Task</button>}
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              {tasks.map((task,i)=>(
                <motion.div key={task._id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*.04}}
                  whileHover={{x:4,boxShadow:'0 4px 24px rgba(99,102,241,.18)'}}
                  style={{padding:'1rem 1.25rem',borderRadius:14,background:'rgba(22,22,40,.85)',border:'1px solid rgba(99,102,241,.12)',display:'flex',alignItems:'center',gap:'1rem',transition:'box-shadow .2s'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:COL_STYLES[task.status].dot,flexShrink:0,boxShadow:`0 0 8px ${COL_STYLES[task.status].dot}66`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'0.875rem',fontWeight:600,color:'#e2e8f0',textDecoration:task.status==='Completed'?'line-through':'none',opacity:task.status==='Completed'?.5:1}}>{task.title}</p>
                    <div style={{display:'flex',gap:'0.75rem',marginTop:4,flexWrap:'wrap'}}>
                      <span className={`badge badge-${task.status==='To Do'?'todo':task.status==='In Progress'?'inprogress':'completed'}`} style={{fontSize:'0.65rem'}}>{task.status}</span>
                      <span style={{fontSize:'0.7rem',color:'#475569',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                        {task.assignedTo?<><User size={11}/>{task.assignedTo.name}</>:'Unassigned'}
                      </span>
                      {task.dueDate&&<span style={{fontSize:'0.7rem',color:isOverdue(task)?'#f43f5e':'#475569',display:'flex',alignItems:'center',gap:'0.25rem'}}><Calendar size={11}/>{fmt(task.dueDate)}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'0.35rem',flexShrink:0}}>
                    <button className="btn-icon" style={{width:30,height:30}} onClick={()=>{setEditTask(task);setShowModal(true);}}><Edit size={13}/></button>
                    {isAdmin&&<button className="btn-icon danger" style={{width:30,height:30}} onClick={()=>handleDelete(task._id)}><Trash2 size={13}/></button>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal&&(
        <TaskModal task={editTask} project={project} allUsers={allUsers}
          onClose={()=>setShowModal(false)} onSaved={load}/>
      )}
    </div>
  );
}
