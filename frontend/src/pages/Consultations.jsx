import { useState } from 'react';
import { useSync } from '../context/useSyncContext';
import { Stethoscope, X, RefreshCw, ClipboardList, Search, Pencil } from 'lucide-react';

const EMPTY = { patientId:'', symptoms:'', diagnosis:'', doctorNotes:'' };

const Consultations = () => {
  const { consultationsList, patientsList, addConsultation, editConsultation, performSync, isSyncing } = useSync();
  const [isOpen, setIsOpen]   = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form,   setForm]     = useState(EMPTY);
  const [search, setSearch]   = useState('');

  const filtered = consultationsList.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditId(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (c) => {
    setEditId(c.id);
    setForm({ patientId:c.patientId || '', symptoms:c.symptoms||'', diagnosis:c.diagnosis, doctorNotes:c.doctorNotes||'' });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis) return;
    const payload = {
      patient_id: form.patientId,
      symptoms: form.symptoms,
      diagnosis: form.diagnosis,
      doctorNotes: form.doctorNotes,
    };
    if (editId) { await editConsultation(editId, payload); } else { await addConsultation(payload); }
    setIsOpen(false); setForm(EMPTY); setEditId(null);
  };

  return (
    <div className="dashboard-body">
      <div className="page-title-box">
        <h2>Consultation Records</h2>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="primary-btn" style={{ background:'#f97316' }} onClick={performSync} disabled={isSyncing}>
            <RefreshCw size={15} className={isSyncing?'spinning':''}/><span>{isSyncing?'Syncing…':'Sync Data'}</span>
          </button>
          <button className="primary-btn" style={{ background:'var(--color-indigo)' }} onClick={openNew}>
            <Stethoscope size={15}/><span>New Consultation</span>
          </button>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1.5px solid var(--border-color)', borderRadius:'10px', padding:'8px 14px', flex:'1', maxWidth:'360px', boxShadow:'var(--shadow-sm)' }}>
          <Search size={15} style={{ color:'var(--text-light)', flexShrink:0 }}/>
          <input type="text" placeholder="Search by patient or ID…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:'none', outline:'none', fontSize:'13.5px', color:'var(--text-main)', background:'transparent', width:'100%', fontFamily:'inherit' }}/>
          {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', padding:0, display:'flex' }}><X size={14}/></button>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', background:'var(--color-indigo-light)', border:'1px solid rgba(79,70,229,0.15)', borderRadius:'8px', padding:'8px 14px', color:'var(--text-muted)' }}>
          <ClipboardList size={14} style={{ color:'var(--color-indigo)' }}/>
          <span><strong style={{ color:'var(--color-indigo)' }}>{filtered.length}</strong> consultations</span>
        </div>
      </div>

      <div className="records-table-wrapper">
        <table className="records-table">
          <thead><tr><th>ID</th><th>Patient</th><th>Symptoms</th><th>Diagnosis</th><th>Doctor Notes</th><th>Doctor</th><th>Time</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--text-light)', padding:'40px', fontSize:'14px' }}>
                {search ? `No results for "${search}"` : 'No consultations yet.'}
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td><code style={{ fontSize:'12px', background:'var(--bg-body)', padding:'2px 7px', borderRadius:'5px', fontWeight:600 }}>{c.id}</code></td>
                <td style={{ fontWeight:500 }}>{c.patientName}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px', maxWidth:'130px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.symptoms||'—'}</td>
                <td><span style={{ background:'var(--color-indigo-light)', color:'var(--color-indigo)', padding:'2px 9px', borderRadius:'6px', fontSize:'12.5px', fontWeight:500 }}>{c.diagnosis}</span></td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px', maxWidth:'130px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.doctorNotes||'—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{c.doctor}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{c.timestamp}</td>
                <td><span className={`status-badge ${c.status==='Synced'?'synced':'pending'}`}>{c.status}</span></td>
                <td><button onClick={()=>openEdit(c)} title="Edit" style={{ background:'var(--color-indigo-light)', border:'none', borderRadius:'7px', padding:'5px 8px', cursor:'pointer', color:'var(--color-indigo)', display:'flex', alignItems:'center' }}><Pencil size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ width:'520px' }}>
            <div className="modal-header" style={{ borderTop:'3px solid var(--color-indigo)' }}>
              <h3>{editId?'Edit Consultation':'Record New Consultation'}</h3>
              <button className="close-btn" onClick={()=>setIsOpen(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Patient</label>
                    <select value={form.patientId} onChange={e=>setForm(f=>({...f,patientId:e.target.value}))} required>
                      <option value="">— Choose a patient —</option>
                      {patientsList.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Symptoms</label>
                    <input type="text" placeholder="e.g. Headache, fever for 2 days" value={form.symptoms} onChange={e=>setForm(f=>({...f,symptoms:e.target.value}))}/>
                  </div>
                  <div className="form-group">
                    <label>Diagnosis / Assessment</label>
                    <input type="text" placeholder="e.g. Mild Fever, General Checkup" value={form.diagnosis} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))} required/>
                  </div>
                  <div className="form-group">
                    <label>Doctor Notes <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label>
                    <input type="text" placeholder="e.g. Rest for 3 days, follow up if fever persists" value={form.doctorNotes} onChange={e=>setForm(f=>({...f,doctorNotes:e.target.value}))}/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={()=>setIsOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ background:'var(--color-indigo)' }}>{editId?'Save Changes':'Record Visit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Consultations;