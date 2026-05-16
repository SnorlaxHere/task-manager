import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash, PencilSimple, UserPlus, Warning } from '@phosphor-icons/react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask]   = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const isAssignee = task?.assignees?.some(a=>a._id===user?._id);
  const myRole = task?.project?.members?.find(m=>m.user===user?._id)?.role;
  const canEdit = isAssignee || myRole==='admin';

  useEffect(()=>{
    api.get(`/tasks/${id}`).then(r=>{
      setTask(r.data);
      setForm({ title:r.data.title, description:r.data.description, priority:r.data.priority, dueDate:r.data.dueDate?r.data.dueDate.slice(0,10):'', progress:r.data.progress, estimatedHours:r.data.estimatedHours||'' });
      if (r.data.project?._id) api.get(`/projects/${r.data.project._id}`).then(pr=>setMembers(pr.data.members||[]));
    }).catch(()=>navigate('/tasks')).finally(()=>setLoading(false));
  },[id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/tasks/${id}`, form);
      setTask(data); setEditing(false); toast.success('Task updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/status`, { status });
      setTask(prev=>({...prev, status:data.status, progress:data.progress}));
      toast.success('Status updated!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); toast.success('Task deleted'); navigate('/tasks'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleAssign = async (uid) => {
    try { await api.post(`/tasks/${id}/assign`, { userId:uid }); const { data } = await api.get(`/tasks/${id}`); setTask(data); toast.success('Assignee added'); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleUnassign = async (uid) => {
    try { await api.delete(`/tasks/${id}/assign/${uid}`); const { data } = await api.get(`/tasks/${id}`); setTask(data); toast.success('Assignee removed'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><div className="spinner" style={{width:36,height:36}}/></div>;
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate)<new Date() && task.status!=='completed';
  const assigneeIds = task.assignees?.map(a=>a._id)||[];
  const nonAssignees = members.filter(m=>!assigneeIds.includes(m.user?._id));

  return (
    <div className="animate-slide-up" style={{maxWidth:800, margin:'0 auto'}}>
      <button className="btn btn-ghost btn-sm mb-3" onClick={()=>navigate(-1)}><ArrowLeft size={16} weight="bold"/> Back</button>

      <div className="card mb-4" style={{position:'relative', overflow:'hidden'}}>
        {isOverdue && <div style={{position:'absolute', top:0, left:0, width:4, height:'100%', background:'var(--danger)', boxShadow:'0 0 10px var(--danger-glow)'}}></div>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          {editing ? (
            <input className="form-input" style={{fontSize:'1.5rem',fontWeight:800,fontFamily:'Outfit, sans-serif',flex:1,marginRight:12}} value={form.title} onChange={e=>set('title',e.target.value)}/>
          ) : (
            <h2 style={{flex:1, color: isOverdue ? 'var(--danger)' : 'var(--text-primary)'}}>{task.title}</h2>
          )}
          <div style={{display:'flex',gap:8}}>
            {canEdit && !editing && <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}><PencilSimple size={16} weight="bold"/> Edit</button>}
            {editing && <>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving?<span className="spinner"/>:'Save'}</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
            </>}
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash size={16} weight="bold"/></button>
          </div>
        </div>

        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:24}}>
          <Badge type={task.status}/>
          <Badge type={task.priority}/>
          {isOverdue && <span className="badge" style={{background:'rgba(239,68,68,.15)',color:'var(--danger)',border:'1px solid rgba(239,68,68,0.3)'}}><Warning size={14} weight="bold"/> Overdue</span>}
        </div>

        <div style={{marginBottom:24}}>
          <label className="form-label">Status</label>
          <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
            {['todo','in_progress','review','completed'].map(s=>(
              <button key={s} onClick={()=>handleStatusChange(s)}
                className={`btn btn-sm ${task.status===s?'btn-primary':'btn-secondary'}`}>
                {s==='todo'?'To Do':s==='in_progress'?'In Progress':s==='review'?'Review':'Completed'}
              </button>
            ))}
          </div>
        </div>

        <div style={{height:1, background:'var(--border)', margin:'24px 0'}}></div>

        <div className="form-row" style={{marginBottom:24}}>
          <div>
            <div className="form-label mb-2">Progress — <span style={{color:'var(--text-primary)', fontWeight:600}}>{editing?form.progress:task.progress}%</span></div>
            {editing ? <input type="range" min={0} max={100} value={form.progress} onChange={e=>set('progress',+e.target.value)} style={{width:'100%', accentColor:'var(--accent)'}}/> : <ProgressBar value={task.progress}/>}
          </div>
          <div>
            <div className="form-label mb-2">Due Date</div>
            {editing ? <input className="form-input" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}/> :
              <span style={{color:isOverdue?'var(--danger)':'var(--text-primary)',fontSize:'.95rem', fontWeight:600}}>{task.dueDate?new Date(task.dueDate).toLocaleDateString():'Not set'}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          {editing ? <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)}/> :
            <div style={{color:'var(--text-secondary)',fontSize:'.95rem',lineHeight:1.6, background:'rgba(0,0,0,0.2)', padding:16, borderRadius:'var(--radius)'}}>{task.description||'No description provided.'}</div>}
        </div>

        <div style={{height:1, background:'var(--border)', margin:'24px 0'}}></div>
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div className="form-label">Assignees</div>
            {nonAssignees.length>0 && (
              <select className="form-select" style={{width:'auto',fontSize:'.85rem'}} onChange={e=>{if(e.target.value){handleAssign(e.target.value);e.target.value=''}}}>
                <option value="">+ Add assignee</option>
                {nonAssignees.map(m=><option key={m.user?._id} value={m.user?._id}>{m.user?.firstName} {m.user?.lastName}</option>)}
              </select>
            )}
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {task.assignees?.length===0 && <span style={{color:'var(--text-muted)',fontSize:'.9rem', fontStyle:'italic'}}>No assignees assigned yet.</span>}
            {task.assignees?.map(a=>(
              <div key={a._id} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',padding:'6px 12px',borderRadius:'99px'}}>
                <Avatar name={`${a.firstName} ${a.lastName}`} size="sm"/>
                <span style={{fontSize:'.85rem', fontWeight:600}}>{a.firstName} {a.lastName}</span>
                <button className="btn btn-ghost" style={{padding:'0 4px', color:'var(--danger)', marginLeft:4}} onClick={()=>handleUnassign(a._id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:20}}>Activity History</h3>
        {task.history?.length===0 ? <p style={{color:'var(--text-muted)',fontSize:'.9rem', fontStyle:'italic'}}>No changes recorded</p> :
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[...task.history].reverse().map((h,i)=>(
              <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start', paddingBottom:16, borderBottom: i < task.history.length-1 ? '1px solid var(--border)' : 'none'}}>
                <Avatar name={`${h.changedBy?.firstName} ${h.changedBy?.lastName}`} size="md"/>
                <div style={{flex:1}}>
                  <div style={{marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:'.95rem',color:'var(--text-primary)'}}>{h.changedBy?.firstName} {h.changedBy?.lastName}</span>
                    <span style={{color:'var(--text-secondary)',fontSize:'.9rem'}}> changed <strong>{h.fieldName}</strong></span>
                  </div>
                  <div style={{background:'rgba(0,0,0,0.2)', padding:'8px 12px', borderRadius:'var(--radius-sm)', fontSize:'.85rem', display:'inline-block'}}>
                     <span style={{textDecoration:'line-through', color:'var(--text-muted)', marginRight:8}}>{h.oldValue || 'none'}</span> 
                     <ArrowLeft size={12} style={{transform:'rotate(180deg)', verticalAlign:'middle', marginRight:8}}/> 
                     <span style={{color:'var(--accent-light)', fontWeight:600}}>{h.newValue}</span>
                  </div>
                  <div style={{fontSize:'.75rem',color:'var(--text-muted)', marginTop:6}}>{new Date(h.changedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
