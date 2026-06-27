import { useState } from 'react';
import { useSync } from '../context/useSyncContext';
import { UserPlus, X, RefreshCw, Users, Search, Pencil, Trash2} from 'lucide-react';

const EMPTY_FORM = { name: '', age: '', gender: 'Female', phone: '', address: '' };

const Patients = () => {
  const { patientsList, addPatient, editPatient, deletePatient, performSync, isSyncing } = useSync();

  const [isOpen,    setIsOpen]    = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [search,    setSearch]    = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = patientsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setIsOpen(true); };
  const openEdit = (pt) => {
    setEditId(pt.id);
    setForm({ name: pt.name, age: pt.age, gender: pt.gender, phone: pt.phone||'', address: pt.address||'' });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age) return;
    if (editId) { await editPatient(editId, form); } else { await addPatient(form); }
    setIsOpen(false); setForm(EMPTY_FORM); setEditId(null);
  };

  return (
    <div className="dashboard-body">
      <div className="page-title-box">
        <h2>Patient Records</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" style={{ background: '#f97316' }} onClick={performSync} disabled={isSyncing}>
            <RefreshCw size={15} className={isSyncing ? 'spinning' : ''}/>
            <span>{isSyncing ? 'Syncing…' : 'Sync Data'}</span>
          </button>
          <button className="primary-btn" style={{ background: 'var(--color-blue)' }} onClick={openNew}>
            <UserPlus size={15}/><span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1.5px solid var(--border-color)', borderRadius:'10px', padding:'8px 14px', flex:'1', maxWidth:'360px', boxShadow:'var(--shadow-sm)' }}>
          <Search size={15} style={{ color:'var(--text-light)', flexShrink:0 }}/>
          <input type="text" placeholder="Search by name or ID…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:'none', outline:'none', fontSize:'13.5px', color:'var(--text-main)', background:'transparent', width:'100%', fontFamily:'inherit' }}/>
          {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', padding:0, display:'flex' }}><X size={14}/></button>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'var(--text-muted)', background:'var(--color-blue-light)', border:'1px solid rgba(47,124,246,0.15)', borderRadius:'8px', padding:'8px 14px' }}>
          <Users size={14} style={{ color:'var(--color-blue)' }}/>
          <span><strong style={{ color:'var(--color-blue)' }}>{filtered.length}</strong> of {patientsList.length} patients</span>
        </div>
      </div>

      {/* Table */}
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead><tr><th>ID</th><th>Name</th><th>Age / Gender</th><th>Phone</th><th>Address</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-light)', padding:'40px', fontSize:'14px' }}>
                {search ? `No patients match "${search}"` : 'No patients yet. Click Add Patient to register one.'}
              </td></tr>
            ) : filtered.map((pt) => (
              <tr key={pt.id}>
                <td><code style={{ fontSize:'12px', background:'var(--bg-body)', padding:'2px 7px', borderRadius:'5px', fontWeight:600 }}>{pt.id}</code></td>
                <td><div className="patient-cell"><div className="patient-avatar">{pt.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><span style={{ fontWeight:500 }}>{pt.name}</span></div></td>
                <td>{pt.age} yrs · {pt.gender}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{pt.phone||'—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px', maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pt.address||'—'}</td>
                <td style={{ color:'var(--text-muted)', fontSize:'13px' }}>{pt.timestamp}</td>
                <td><span className={`status-badge ${pt.status==='Synced'?'synced':'pending'}`}>{pt.status}</span></td>
                <td>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button onClick={()=>openEdit(pt)} title="Edit" style={{ background:'var(--color-blue-light)', border:'none', borderRadius:'7px', padding:'5px 8px', cursor:'pointer', color:'var(--color-blue)', display:'flex', alignItems:'center' }}><Pencil size={13}/></button>
                    <button onClick={()=>setDeleteConfirm(pt.id)} title="Delete" style={{ background:'var(--color-red-light)', border:'none', borderRadius:'7px', padding:'5px 8px', cursor:'pointer', color:'var(--color-red)', display:'flex', alignItems:'center' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header" style={{ borderTop:'3px solid var(--color-blue)' }}>
              <h3>{editId ? 'Edit Patient' : 'Register New Patient'}</h3>
              <button className="close-btn" onClick={()=>setIsOpen(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group"><label>Full Name</label><input type="text" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required autoFocus/></div>
                  <div className="form-row-2">
                    <div className="form-group"><label>Age</label><input type="number" placeholder="35" min="0" max="120" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} required/></div>
                    <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}><option>Male</option><option>Female</option><option>Other</option></select></div>
                  </div>
                  <div className="form-group"><label>Phone <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label><input type="tel" placeholder="9876543210" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
                  <div className="form-group"><label>Address <span style={{ fontWeight:400, color:'var(--text-light)' }}>(optional)</span></label><input type="text" placeholder="Village, District" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={()=>setIsOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ background:'var(--color-blue)' }}>{editId?'Save Changes':'Register Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth:'380px' }}>
            <div className="modal-header" style={{ borderTop:'3px solid var(--color-red)' }}>
              <h3>Delete Patient?</h3>
              <button className="close-btn" onClick={()=>setDeleteConfirm(null)}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize:'14px', color:'var(--text-muted)', lineHeight:1.6 }}>
                This will permanently remove record <strong>({deleteConfirm})</strong>. This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
              <button className="primary-btn" style={{ background:'var(--color-red)' }} onClick={()=>{ deletePatient(deleteConfirm); setDeleteConfirm(null); }}>
                <Trash2 size={14}/> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;