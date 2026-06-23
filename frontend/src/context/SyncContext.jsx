import { createContext, useState, useEffect } from 'react';

export const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline]         = useState(navigator.onLine);
  const [pendingSync, setPendingSync]   = useState(12);
  const [lastSyncTime, setLastSyncTime] = useState('09:45 AM');
  const [totalPatients, setTotalPatients] = useState(1248);
  const [todayVisits, setTodayVisits]   = useState(32);

  const [patientsCount, setPatientsCount]           = useState(32);
  const [consultationsCount, setConsultationsCount] = useState(18);
  const [prescriptionsCount, setPrescriptionsCount] = useState(14);
  const [vaccinationsCount, setVaccinationsCount]   = useState(8);

  const [patientsList, setPatientsList] = useState([
    { id:'PT01', name:'Rohan Sharma',  age:24, gender:'Male',   phone:'9876543210', address:'Village Rampur', status:'Synced', timestamp:'18 May 2025' },
    { id:'PT02', name:'Sunita Verma',  age:38, gender:'Female', phone:'9765432109', address:'Block C, Almora',  status:'Synced', timestamp:'18 May 2025' },
    { id:'PT03', name:'Kabir Dev',     age:8,  gender:'Male',   phone:'',           address:'',               status:'Synced', timestamp:'18 May 2025' },
    { id:'PT04', name:'Preeti Negi',   age:62, gender:'Female', phone:'9654321098', address:'Dist. Nainital',  status:'Synced', timestamp:'18 May 2025' },
  ]);

  const [consultationsList, setConsultationsList] = useState([
    { id:'CN01', patientName:'Rohan Sharma', symptoms:'High fever, headache',    diagnosis:'Mild Fever',   doctorNotes:'Rest for 2 days',  doctor:'Dr. Anjali Sharma', status:'Synced', timestamp:'10:15 AM' },
    { id:'CN02', patientName:'Sunita Verma', symptoms:'Sore throat, runny nose', diagnosis:'Cough & Cold', doctorNotes:'Stay hydrated',    doctor:'Dr. Anjali Sharma', status:'Synced', timestamp:'09:30 AM' },
  ]);

  const [prescriptionsList, setPrescriptionsList] = useState([
    { id:'PR01', patientName:'Rohan Sharma', consultationId:'CN01', medicine:'Paracetamol', dosage:'650mg - TDS', duration:'3 Days', status:'Synced', timestamp:'10:15 AM' },
    { id:'PR02', patientName:'Sunita Verma', consultationId:'CN02', medicine:'Amoxicillin', dosage:'500mg - BD',  duration:'5 Days', status:'Synced', timestamp:'09:30 AM' },
  ]);

  const [vaccinationsList, setVaccinationsList] = useState([
    { id:'VC01', patientName:'Kabir Dev', vaccine:'MMR Dose 2', batch:'MR8829', vaccinationDate:'2025-05-18', vacStatus:'Administered', status:'Synced', timestamp:'09:15 AM' },
  ]);

  const [syncLogs, setSyncLogs] = useState([
    { id:1, type:'success', title:'Full Database Sync Complete', desc:'Uploaded 48 patient records and 12 consults', time:'09:45 AM' },
    { id:2, type:'success', title:'Routine Module Sync',         desc:'Synced 8 prescriptions and 3 vaccinations',  time:'07:15 AM' },
  ]);

  // Sync Queue — displayed in Sync Center (Entity, Operation, Status, Timestamp, Error)
  const [syncQueue, setSyncQueue] = useState([]);

  const [toast,     setToast]     = useState({ show:false, message:'', type:'success' });
  const [isSyncing, setIsSyncing] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => {
    const n = new Date(); let h = n.getHours(), m = n.getMinutes(), ap = h>=12?'PM':'AM';
    h = h%12||12; return `${h}:${m<10?'0'+m:m} ${ap}`;
  });

  const [currentDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
  );

  useEffect(() => {
    let d = new Date();
    const t = setInterval(() => {
      d.setSeconds(d.getSeconds() + 1);
      let h = d.getHours(), m = d.getMinutes(), ap = h>=12?'PM':'AM';
      h = h%12||12; setCurrentTime(`${h}:${m<10?'0'+m:m} ${ap}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show:true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show:false })), 3500);
  };

  const addToQueue = (entityType, operation) => {
    setSyncQueue(q => [...q, { entityType, operation, syncStatus:'Pending', timestamp: new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }), errorMessage:'' }]);
  };

  const toggleConnection = () => {
    setIsOnline(prev => {
      const next = !prev;
      if (next && pendingSync > 0) setTimeout(() => performSync(), 500);
      showToast(next ? 'System is now Online. Ready to sync records.' : 'System is now Offline. Changes will be saved locally.');
      return next;
    });
  };

  // ── PATIENTS ──
  const addPatient = (details) => {
    const newId = `PT${String(patientsList.length + 1).padStart(2, '0')}`;
    setPatientsList(p => [{ id:newId, name:details.name, age:parseInt(details.age), gender:details.gender, phone:details.phone||'', address:details.address||'', status:'Pending Sync', timestamp:currentDate }, ...p]);
    setTotalPatients(p => p+1); setPatientsCount(p => p+1); setPendingSync(p => p+1);
    addToQueue('Patient', 'CREATE');
    showToast(`Patient "${details.name}" added locally!`);
  };

  const editPatient = (id, details) => {
    setPatientsList(p => p.map(pt => pt.id === id ? { ...pt, ...details, status:'Pending Sync' } : pt));
    setPendingSync(p => p+1);
    addToQueue('Patient', 'UPDATE');
    showToast('Patient record updated locally.');
  };

  const deletePatient = (id) => {
    setPatientsList(p => p.filter(pt => pt.id !== id));
    setTotalPatients(p => p-1); setPatientsCount(p => Math.max(0, p-1)); setPendingSync(p => p+1);
    addToQueue('Patient', 'DELETE');
    showToast('Patient record deleted.');
  };

  // ── CONSULTATIONS ──
  const addConsultation = (details) => {
    const newId = `CN${String(consultationsList.length + 1).padStart(2, '0')}`;
    setConsultationsList(p => [{ id:newId, patientName:details.patientName, symptoms:details.symptoms||'', diagnosis:details.diagnosis, doctorNotes:details.doctorNotes||'', doctor:'Dr. Anjali Sharma', status:'Pending Sync', timestamp:currentTime }, ...p]);
    setTodayVisits(p => p+1); setConsultationsCount(p => p+1); setPendingSync(p => p+1);
    addToQueue('Consultation', 'CREATE');
    showToast(`Consultation recorded for "${details.patientName}" locally!`);
  };

  const editConsultation = (id, details) => {
    setConsultationsList(p => p.map(c => c.id === id ? { ...c, ...details, status:'Pending Sync' } : c));
    setPendingSync(p => p+1);
    addToQueue('Consultation', 'UPDATE');
    showToast('Consultation updated locally.');
  };

  // ── PRESCRIPTIONS ──
  const addPrescription = (details) => {
    const newId = `PR${String(prescriptionsList.length + 1).padStart(2, '0')}`;
    setPatientsList(p => p); // no-op, just consistent
    setPrescriptionsList(p => [{ id:newId, patientName:details.patientName, consultationId:details.consultationId||'', medicine:details.medicine, dosage:details.dosage, duration:details.duration||'', status:'Pending Sync', timestamp:currentTime }, ...p]);
    setPrescriptionsCount(p => p+1); setPendingSync(p => p+1);
    addToQueue('Prescription', 'CREATE');
    showToast('Prescription saved locally!');
  };

  const editPrescription = (id, details) => {
    setPrescriptionsList(p => p.map(r => r.id === id ? { ...r, ...details, status:'Pending Sync' } : r));
    setPendingSync(p => p+1);
    addToQueue('Prescription', 'UPDATE');
    showToast('Prescription updated locally.');
  };

  // ── VACCINATIONS ──
  const addVaccination = (details) => {
    const newId = `VC${String(vaccinationsList.length + 1).padStart(2, '0')}`;
    setVaccinationsList(p => [{ id:newId, patientName:details.patientName, vaccine:details.vaccine, batch:details.batch||'VC9901', vaccinationDate:details.vaccinationDate||'', vacStatus:details.vacStatus||'Administered', status:'Pending Sync', timestamp:currentTime }, ...p]);
    setVaccinationsCount(p => p+1); setPendingSync(p => p+1);
    addToQueue('Vaccination', 'CREATE');
    showToast('Vaccination recorded locally!');
  };

  const editVaccination = (id, details) => {
    setVaccinationsList(p => p.map(v => v.id === id ? { ...v, ...details, status:'Pending Sync' } : v));
    setPendingSync(p => p+1);
    addToQueue('Vaccination', 'UPDATE');
    showToast('Vaccination updated locally.');
  };

  // ── SYNC ──
  const performSync = () => {
    if (isSyncing || !isOnline) return;
    if (pendingSync === 0) { showToast('All records are already up to date!'); return; }
    setIsSyncing(true);

    setTimeout(() => {
      const now = new Date();
      let h = now.getHours(), m = now.getMinutes(), ap = h>=12?'PM':'AM';
      h = h%12||12;
      const ts = `${h}:${m<10?'0'+m:m} ${ap}`;

      setLastSyncTime(ts);
      setPatientsList(p => p.map(r => ({ ...r, status:'Synced' })));
      setConsultationsList(p => p.map(r => ({ ...r, status:'Synced' })));
      setPrescriptionsList(p => p.map(r => ({ ...r, status:'Synced' })));
      setVaccinationsList(p => p.map(r => ({ ...r, status:'Synced' })));
      setSyncQueue(q => q.map(r => ({ ...r, syncStatus:'Synced' })));
      setSyncLogs(p => [{ id:p.length+1, type:'success', title:'Manual Synchronization Complete', desc:`Successfully uploaded ${pendingSync} pending record(s) to server.`, time:ts }, ...p]);
      setPendingSync(0);
      setIsSyncing(false);
      showToast('All pending records uploaded successfully!');
    }, 2200);
  };

  const retryFailed = () => {
    const failedCount = syncQueue.filter(q => q.syncStatus === 'Failed').length;
    if (failedCount === 0) { showToast('No failed records to retry.'); return; }
    setSyncQueue(q => q.map(r => r.syncStatus === 'Failed' ? { ...r, syncStatus:'Pending' } : r));
    showToast(`Retrying ${failedCount} failed record(s)…`);
    setTimeout(() => performSync(), 300);
  };

  useEffect(() => {
    if (isOnline && pendingSync > 0 && !isSyncing) performSync();
  }, [isOnline, pendingSync, isSyncing]);

  return (
    <SyncContext.Provider value={{
      isOnline, pendingSync, lastSyncTime, totalPatients, todayVisits,
      patientsCount, consultationsCount, prescriptionsCount, vaccinationsCount,
      patientsList, consultationsList, prescriptionsList, vaccinationsList,
      syncLogs, syncQueue, toast, isSyncing, currentTime, currentDate,
      toggleConnection,
      addPatient, editPatient, deletePatient,
      addConsultation, editConsultation,
      addPrescription, editPrescription,
      addVaccination, editVaccination,
      performSync, retryFailed, showToast,
    }}>
      {children}
    </SyncContext.Provider>
  );
};