import { useState } from 'react';
import { useSync } from '../context/useSyncContext';
import { Pill, X, RefreshCw, Search, Pencil } from 'lucide-react';

const EMPTY = { patientName:'', consultationId:'', medicine:'', dosage:'', duration:'' };

const Prescriptions = () => {
  const { prescriptionsList, patientsList, consultationsList, addPrescription, editPrescription, performSync, isSyncing } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState(EMPTY);
  const [search, setSearch] = useState('');

  const filtered = prescriptionsList.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setEditId(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ patientName:p.patientName, consultationId:p.consultationId||'', medicine:p.medicine, dosage:p.dosage, duration:p.duration||'' });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.medicine || !form.dosage) return;
    if (editId) { editPrescription(editId, form); } else { addPrescription(form); }
    setIsOpen(false); setForm(EMPTY); setEditId(null);
  };

  return (
    <div className="dashboard-body">
      <div className="page-title-box">
        <h2>Prescription Records</h2>
        <div style={{ display:'flex', gap:'10px' }}>
          {/* Sync button — teal/green across all pages */}
          <button
            className="primary-btn"
            style={{ background:'var(--color-green)', boxShadow:'0 2px 8px rgba(13,158,110,0.25)' }}
            onClick={performSync}
            disabled={isSyncing}
          >
            <RefreshCw size={15} className={isSyncing ? 'spinning' : ''}/>
            <span>{isSyncing ? 'Syncing…' : 'Sync Data'}</span>
          </button>

          {/* Add button — orange (page accent) */}
          <button
            className="primary-btn"
            style={{ background:'var(--color-orange)', boxShadow:'0 2px 8px rgba(249,115,22,0.25)' }}
            onClick={openNew}
          >
            <Pill size={15}/><span>Add Prescription</span>
          </button>
        </div>
      </div>

      {/* Search + count */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1.5px solid var(--border-color)', borderRadius:'10px', padding:'8px 14px', flex:'1', maxWidth:'360px', boxShadow:'var(--shadow-sm)' }}>
          <Search size={15} style={{ color:'var(--text-light)', flexShrink:0 }}/>
          <input
            type="text"
            placeholder="Search by patient or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border:'none', outline:'none', fontSize:'13.5px', color:'var(--text-main)', background:'transparent', width:'100%', fontFamily:'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', padding:0, display:'flex' }}>
              <X size={14}/>
            </button>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', background:'var(--color-orange-light)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'8px', padding:'8px 14px', color:'var(--text-muted)' }}>
          <Pill size={14} style={{ color:'var(--color-orange)' }}/>
          <span><strong style={{ color:'var(--color-orange)' }}>{filtered.length}</strong> prescriptions</span>
        </div>
      </div>

      {/* Table */}
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th>ID</th><th>Patient</th><th>Consultation</th><th>Medicine</th>
              <th>Dosage</th><th>Duration</th><th>Time</th><th>Status</th><th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign:'center', color:'var(--text-light)', padding:'40px', fontSize:'14px' }}>
                  {search ? `No results for "${search}"` : 'No prescriptions yet. Click Add Prescription to issue one.'}
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <code style={{ fontSize:'12px', background:'var(--bg-body)', padding:'2px 7px', borderRadius:'5px', fontWeight:600 }}>{p.id}</code>
                </td>
                <td style={{ fontWeight:500 }}>{p.patientName}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{p.consultationId || '—'}</td>
                <td>
                  <span style={{ background:'var(--color-orange-light)', color:'var(--color-orange)', padding:'2px 9px', borderRadius:'6px', fontSize:'12.5px', fontWeight:500 }}>
                    {p.medicine}
                  </span>
                </td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{p.dosage}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{p.duration || '—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{p.timestamp}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Synced' ? 'synced' : 'pending'}`}>{p.status}</span>
                </td>
                <td>
                  <button
                    onClick={() => openEdit(p)}
                    title="Edit prescription"
                    style={{ background:'var(--color-orange-light)', border:'none', borderRadius:'7px', padding:'5px 8px', cursor:'pointer', color:'var(--color-orange)', display:'flex', alignItems:'center' }}
                  >
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
            <div className="modal-header" style={{ borderTop:'3px solid var(--color-orange)' }}>
              <h3>{editId ? 'Edit Prescription' : 'Issue New Prescription'}</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Patient</label>
                    <select value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName:e.target.value }))} required autoFocus>
                      <option value="">— Choose a patient —</option>
                      {patientsList.map(p => <option key={p.id} value={p.name}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Linked Consultation <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label>
                    <select value={form.consultationId} onChange={e => setForm(f => ({ ...f, consultationId:e.target.value }))}>
                      <option value="">— None —</option>
                      {consultationsList.map(c => <option key={c.id} value={c.id}>{c.id} — {c.patientName} ({c.diagnosis})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Medicine Name</label>
                    <input type="text" placeholder="e.g. Paracetamol 650mg" value={form.medicine} onChange={e => setForm(f => ({ ...f, medicine:e.target.value }))} required/>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Dosage</label>
                      <input type="text" placeholder="e.g. 500mg - BD" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage:e.target.value }))} required/>
                    </div>
                    <div className="form-group">
                      <label>Duration <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label>
                      <input type="text" placeholder="e.g. 5 Days" value={form.duration} onChange={e => setForm(f => ({ ...f, duration:e.target.value }))}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ background:'var(--color-orange)', boxShadow:'0 2px 8px rgba(249,115,22,0.25)' }}
                >
                  {editId ? 'Save Changes' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;