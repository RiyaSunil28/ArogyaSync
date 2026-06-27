import { useState } from 'react';
import { useSync } from '../context/useSyncContext';
import { Syringe, X, RefreshCw, Search, Pencil } from 'lucide-react';

const EMPTY = { patientId:'', vaccine:'', batch:'', vaccinationDate:'', vacStatus:'Administered' };

const Vaccinations = () => {
  const { vaccinationsList, patientsList, addVaccination, editVaccination, performSync, isSyncing } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState(EMPTY);
  const [search, setSearch] = useState('');

  const filtered = vaccinationsList.filter(v =>
    v.patientName.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setEditId(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (v) => {
    setEditId(v.id);
    setForm({ 
      patientId: v.patientId || '', 
      vaccine: v.vaccine, 
      batch: v.batch||'', 
      vaccinationDate: v.vaccinationDate||'', 
      vacStatus: v.vacStatus||'Administered' 
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.vaccine) return;
    const payload = {
      patient_id: form.patientId,
      vaccine: form.vaccine,
      vaccinationDate: form.vaccinationDate,
      vacStatus: form.vacStatus,
    };
    if (editId) { await editVaccination(editId, payload); } else { await addVaccination(payload); }
    setIsOpen(false); setForm(EMPTY); setEditId(null);
  };

  const statusColor = { Administered:'var(--color-green)', Scheduled:'var(--color-blue)', Missed:'var(--color-red)' };
  const statusBg    = { Administered:'var(--color-green-light)', Scheduled:'var(--color-blue-light)', Missed:'var(--color-red-light)' };

  return (
    <div className="dashboard-body">
      <div className="page-title-box">
        <h2>Vaccination Records</h2>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="primary-btn" style={{ background:'#f97316' }} onClick={performSync} disabled={isSyncing}>
            <RefreshCw size={15} className={isSyncing?'spinning':''}/><span>{isSyncing?'Syncing…':'Sync Data'}</span>
          </button>
          <button className="primary-btn" style={{ background:'var(--color-purple)' }} onClick={openNew}>
            <Syringe size={15}/><span>Record Vaccination</span>
          </button>
        </div>
      </div>

      {/* Search + count */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1.5px solid var(--border-color)', borderRadius:'10px', padding:'8px 14px', flex:'1', maxWidth:'360px', boxShadow:'var(--shadow-sm)' }}>
          <Search size={15} style={{ color:'var(--text-light)', flexShrink:0 }}/>
          <input type="text" placeholder="Search by patient or ID…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:'none', outline:'none', fontSize:'13.5px', color:'var(--text-main)', background:'transparent', width:'100%', fontFamily:'inherit' }}/>
          {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', padding:0, display:'flex' }}><X size={14}/></button>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', background:'var(--color-purple-light)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'8px', padding:'8px 14px', color:'var(--text-muted)' }}>
          <Syringe size={14} style={{ color:'var(--color-purple)' }}/>
          <span><strong style={{ color:'var(--color-purple)' }}>{filtered.length}</strong> vaccinations</span>
        </div>
      </div>

      {/* Table */}
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th>ID</th><th>Patient</th><th>Vaccine</th><th>Batch No.</th>
              <th>Vaccination Date</th><th>Status</th><th>Recorded At</th><th>Sync</th><th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--text-light)', padding:'40px', fontSize:'14px' }}>
                {search ? `No results for "${search}"` : 'No vaccination records yet. Click Record Vaccination to add one.'}
              </td></tr>
            ) : filtered.map(v => (
              <tr key={v.id}>
                <td><code style={{ fontSize:'12px', background:'var(--bg-body)', padding:'2px 7px', borderRadius:'5px', fontWeight:600 }}>{v.id}</code></td>
                <td style={{ fontWeight:500 }}>{v.patientName}</td>
                <td>
                  <span style={{ background:'var(--color-purple-light)', color:'var(--color-purple)', padding:'2px 9px', borderRadius:'6px', fontSize:'12.5px', fontWeight:500 }}>
                    {v.vaccine}
                  </span>
                </td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{v.batch||'—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{v.vaccinationDate||'—'}</td>
                <td>
                  <span style={{
                    background: statusBg[v.vacStatus] || 'var(--color-green-light)',
                    color: statusColor[v.vacStatus] || 'var(--color-green)',
                    padding:'2px 9px', borderRadius:'6px', fontSize:'12px', fontWeight:600
                  }}>
                    {v.vacStatus||'Administered'}
                  </span>
                </td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{v.timestamp}</td>
                <td><span className={`status-badge ${v.status==='Synced'?'synced':'pending'}`}>{v.status}</span></td>
                <td>
                  <button onClick={()=>openEdit(v)} title="Edit vaccination"
                    style={{ background:'var(--color-purple-light)', border:'none', borderRadius:'7px', padding:'5px 8px', cursor:'pointer', color:'var(--color-purple)', display:'flex', alignItems:'center' }}>
                    <Pencil size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ width:'520px' }}>
            <div className="modal-header" style={{ borderTop:'3px solid var(--color-purple)' }}>
              <h3>{editId ? 'Edit Vaccination Record' : 'Record Vaccination Dose'}</h3>
              <button className="close-btn" onClick={()=>setIsOpen(false)} aria-label="Close"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Patient</label>
                    <select value={form.patientId} onChange={e=>setForm(f=>({...f,patientId:e.target.value}))} required autoFocus>
                      <option value="">— Choose a patient —</option>
                      {patientsList.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Vaccine Name</label>
                      <input type="text" placeholder="e.g. BCG / MMR / Covaxin" value={form.vaccine} onChange={e=>setForm(f=>({...f,vaccine:e.target.value}))} required/>
                    </div>
                    <div className="form-group">
                      <label>Batch No. <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label>
                      <input type="text" placeholder="e.g. COV9912" value={form.batch} onChange={e=>setForm(f=>({...f,batch:e.target.value}))}/>
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Vaccination Date</label>
                      <input type="date" value={form.vaccinationDate} onChange={e=>setForm(f=>({...f,vaccinationDate:e.target.value}))}/>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={form.vacStatus} onChange={e=>setForm(f=>({...f,vacStatus:e.target.value}))}>
                        <option value="Administered">Administered</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Missed">Missed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={()=>setIsOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ background:'var(--color-purple)' }}>
                  {editId ? 'Save Changes' : 'Record Dose'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vaccinations;