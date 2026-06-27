import { useState, useEffect, useCallback } from 'react';
import { authApi, consultationsApi, patientsApi, prescriptionsApi, syncApi, vaccinationsApi } from '../services/api.js';
import { SyncContext } from './SyncContext.js';

// ── localStorage helpers ──────────────────────────────────────────────────
const LS = {
  get: (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};

const LS_KEYS = {
  patients:      'arogya_patients',
  consultations: 'arogya_consultations',
  prescriptions: 'arogya_prescriptions',
  vaccinations:  'arogya_vaccinations',
  pendingQueue:  'arogya_pending_queue',
  lastSync:      'arogya_last_sync',
};

const normalizePatient = (item) => ({
  id: item.id,
  name: item.name,
  age: item.age,
  gender: item.gender,
  phone: item.phone || '',
  address: item.address || '',
  status: 'Synced',
  timestamp: new Date(item.created_at).toLocaleDateString('en-GB'),
});

export const SyncProvider = ({ children }) => {
  const [currentUser, setCurrentUser]     = useState(null);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [pendingSync, setPendingSync]     = useState(0);
  const [lastSyncTime, setLastSyncTime]   = useState(LS.get(LS_KEYS.lastSync, 'Not synced yet'));
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayVisits, setTodayVisits]     = useState(0);

  const [patientsCount, setPatientsCount]           = useState(0);
  const [consultationsCount, setConsultationsCount] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [vaccinationsCount, setVaccinationsCount]   = useState(0);

  // ── Initialise lists from localStorage so data survives page reloads ──
  const [patientsList, setPatientsList]         = useState(() => LS.get(LS_KEYS.patients, []));
  const [consultationsList, setConsultationsList] = useState(() => LS.get(LS_KEYS.consultations, []));
  const [prescriptionsList, setPrescriptionsList] = useState(() => LS.get(LS_KEYS.prescriptions, []));
  const [vaccinationsList, setVaccinationsList]   = useState(() => LS.get(LS_KEYS.vaccinations, []));
  const [pendingQueue, setPendingQueue]           = useState(() => LS.get(LS_KEYS.pendingQueue, []));

  const [syncLogs, setSyncLogs]   = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);

  const [toast, setToast]           = useState({ show: false, message: '', type: 'success' });
  const [isSyncing, setIsSyncing]   = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError]   = useState('');

  const [currentTime, setCurrentTime] = useState(() => {
    const n = new Date(); let h = n.getHours(), m = n.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
  });

  const [currentDate] = useState(() =>
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  );

  // ── Persist lists to localStorage whenever they change ────────────────
  useEffect(() => { LS.set(LS_KEYS.patients,      patientsList);      }, [patientsList]);
  useEffect(() => { LS.set(LS_KEYS.consultations,  consultationsList); }, [consultationsList]);
  useEffect(() => { LS.set(LS_KEYS.prescriptions,  prescriptionsList); }, [prescriptionsList]);
  useEffect(() => { LS.set(LS_KEYS.vaccinations,   vaccinationsList);  }, [vaccinationsList]);
  useEffect(() => { LS.set(LS_KEYS.pendingQueue,   pendingQueue);      }, [pendingQueue]);
  useEffect(() => { LS.set(LS_KEYS.lastSync,       lastSyncTime);      }, [lastSyncTime]);

  // ── Sync counts with lists ─────────────────────────────────────────────
  useEffect(() => {
    setPatientsCount(patientsList.length);
    setTotalPatients(patientsList.length);
  }, [patientsList]);

  useEffect(() => {
    setConsultationsCount(consultationsList.length);
    setTodayVisits(consultationsList.length);
  }, [consultationsList]);

  useEffect(() => { setPrescriptionsCount(prescriptionsList.length); }, [prescriptionsList]);
  useEffect(() => { setVaccinationsCount(vaccinationsList.length);   }, [vaccinationsList]);
  useEffect(() => { setPendingSync(pendingQueue.filter(q => q.syncStatus === 'PENDING').length); }, [pendingQueue]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast((p) => ({ ...p, show: false })), 3500);
  }, []);

  const addToQueue = useCallback((entityType, operation, localId, payload) => {
    const entry = { entityType, operation, localId, payload, syncStatus: 'PENDING', timestamp: new Date().toISOString(), errorMessage: '' };
    setPendingQueue(q => [...q, entry]);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const user = await authApi.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const [patientsResponse, consultationsResponse] = await Promise.all([
        patientsApi.list({ limit: 100 }),
        consultationsApi.list({ limit: 100 }),
      ]);

      const patients = (patientsResponse?.items || []).map(normalizePatient);

      const consultations = (consultationsResponse?.items || []).map((item) => {
        const patientObj = patients.find((p) => p.id === item.patient_id);
        return {
          id: item.id, patientId: item.patient_id,
          patientName: patientObj ? patientObj.name : 'Unknown Patient',
          symptoms: item.symptoms || '', diagnosis: item.diagnosis || '',
          doctorNotes: item.doctor_notes || '', doctor: 'Dr. Anjali Sharma',
          status: 'Synced', timestamp: new Date(item.created_at).toLocaleDateString('en-GB'),
        };
      });

      const consultationIds = consultations.map((item) => item.id);
      const patientIds      = patients.map((item) => item.id);

      const [prescriptionResponses, vaccinationResponses] = await Promise.all([
        Promise.all(consultationIds.map((id) => prescriptionsApi.listByConsultation(id).catch(() => []))),
        Promise.all(patientIds.map((id) => vaccinationsApi.listByPatient(id).catch(() => []))),
      ]);

      const prescriptions = prescriptionResponses.flat().map((item) => {
        const consultationObj = consultations.find((c) => c.id === item.consultation_id);
        return {
          id: item.id, consultationId: item.consultation_id,
          patientName: consultationObj ? consultationObj.patientName : 'Unknown Patient',
          medicine: item.medicine_name, dosage: item.dosage, duration: item.duration || '',
          status: 'Synced', timestamp: new Date(item.created_at).toLocaleDateString('en-GB'),
        };
      });

      const vaccinations = vaccinationResponses.flat().map((item) => {
        const patientObj = patients.find((p) => p.id === item.patient_id);
        return {
          id: item.id, patientId: item.patient_id,
          patientName: patientObj ? patientObj.name : 'Unknown Patient',
          vaccine: item.vaccine_name, batch: '',
          vaccinationDate: item.vaccination_date, vacStatus: item.status,
          status: 'Synced', timestamp: new Date(item.created_at).toLocaleDateString('en-GB'),
        };
      });

      setPatientsList(patients);
      setConsultationsList(consultations);
      setPrescriptionsList(prescriptions);
      setVaccinationsList(vaccinations);
    } catch (error) {
      // ── Offline fallback: use localStorage data ──
      console.warn('Could not load from API, using cached data:', error.message);
      const cachedPatients = LS.get(LS_KEYS.patients, []);
      if (cachedPatients.length > 0) {
        showToast('Offline — showing cached records', 'info');
      } else {
        setDataError(error.message || 'Unable to load records');
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    let d = new Date();
    const t = window.setInterval(() => {
      d.setSeconds(d.getSeconds() + 1);
      let h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12; setCurrentTime(`${h}:${m < 10 ? '0' + m : m} ${ap}`);
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onLine  = () => setIsOnline(true);
    const offLine = () => setIsOnline(false);
    window.addEventListener('online',  onLine);
    window.addEventListener('offline', offLine);
    return () => { window.removeEventListener('online', onLine); window.removeEventListener('offline', offLine); };
  }, []);

 // ── Backend health check — detects if backend is reachable ────────────
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch('http://127.0.0.1:8000/', {
          signal: controller.signal
        });
        clearTimeout(timeout);
       if (response.ok) {
          setIsOnline(prev => {
            if (!prev) {
              setTimeout(() => processPendingQueue(), 1000);
              showToast('Back online! Syncing pending records...');
            }
            return true;
          });
        }
      } catch {
        setIsOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);
  const refreshSyncState = async () => {
    try {
      const [queueResponse, statusResponse] = await Promise.all([syncApi.queue({ limit: 100 }), syncApi.status()]);
      const queueItems = (queueResponse || []).map((item) => ({
        entityType: item.entity_type, operation: item.operation_type,
        syncStatus: item.sync_status,
        timestamp: new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        errorMessage: item.error_message || '',
      }));
      setSyncQueue(queueItems);
      setPendingSync(queueItems.filter((item) => item.syncStatus === 'PENDING').length);
      setLastSyncTime(statusResponse?.cloud_connected ? 'Connected' : 'Offline');
    } catch {
      setLastSyncTime('Unavailable');
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        loadUser();
        loadData();
        refreshSyncState();
      } else {
        setCurrentUser(null);
        setIsLoadingData(false);
        setDataError('');
        // Clear all localStorage caches on logout
        Object.values(LS_KEYS).forEach(k => LS.remove(k));
        setPatientsList([]);
        setConsultationsList([]);
        setPrescriptionsList([]);
        setVaccinationsList([]);
        setPendingQueue([]);
        setPatientsCount(0); setTotalPatients(0);
        setConsultationsCount(0); setTodayVisits(0);
        setPrescriptionsCount(0); setVaccinationsCount(0);
        setSyncQueue([]);
      }
    };
    window.addEventListener('auth:changed', handleAuthChange);
    handleAuthChange();
    return () => window.removeEventListener('auth:changed', handleAuthChange);
  }, [loadUser, loadData]);

  

  const processPendingQueue = async () => {
    const pending = pendingQueue.filter(q => q.syncStatus === 'PENDING');
    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        if (item.entityType === 'Patient' && item.operation === 'CREATE') {
          await patientsApi.create(item.payload);
        } else if (item.entityType === 'Patient' && item.operation === 'UPDATE') {
          await patientsApi.update(item.localId, item.payload);
        } else if (item.entityType === 'Patient' && item.operation === 'DELETE') {
          await patientsApi.remove(item.localId);
        } else if (item.entityType === 'Consultation' && item.operation === 'CREATE') {
          await consultationsApi.create(item.payload);
        } else if (item.entityType === 'Prescription' && item.operation === 'CREATE') {
          await prescriptionsApi.create(item.payload);
        } else if (item.entityType === 'Vaccination' && item.operation === 'CREATE') {
          await vaccinationsApi.create(item.payload);
        }
        // Mark as synced
        setPendingQueue(q => q.map(qi => qi === item ? { ...qi, syncStatus: 'SYNCED' } : qi));
      } catch (err) {
        setPendingQueue(q => q.map(qi => qi === item ? { ...qi, syncStatus: 'FAILED', errorMessage: err.message } : qi));
      }
    }
    // Reload fresh data from server
    await loadData();
    await refreshSyncState();
    showToast('Pending records synced successfully!');
    const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(ts);
    setSyncLogs(p => [{ id: p.length + 1, type: 'success', title: 'Auto Sync Complete', desc: `Synced ${pending.length} pending record(s).`, time: ts }, ...p]);
  };

  // ── PATIENTS ───────────────────────────────────────────────────────────
  const addPatient = async (details) => {
    const payload = { name: details.name, age: Number(details.age), gender: details.gender, phone: details.phone || null, address: details.address || null };
    const tempId  = `local_${Date.now()}`;

    if (!isOnline) {
      // Store locally with Pending Sync status
      const localEntry = { id: tempId, ...payload, phone: payload.phone||'', address: payload.address||'', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setPatientsList(p => [localEntry, ...p]);
      setTotalPatients(p => p + 1); setPatientsCount(p => p + 1);
      addToQueue('Patient', 'CREATE', tempId, payload);
      showToast(`Patient "${details.name}" saved locally — will sync when online.`);
      return;
    }
    try {
      const created    = await patientsApi.create(payload);
      const normalized = normalizePatient(created);
      setPatientsList(p => [normalized, ...p]);
      setTotalPatients(p => p + 1); setPatientsCount(p => p + 1);
      showToast(`Patient "${details.name}" created.`);
      await refreshSyncState();
    } catch (error) {
      // API failed — save locally
      const localEntry = { id: tempId, ...payload, phone: payload.phone||'', address: payload.address||'', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setPatientsList(p => [localEntry, ...p]);
      setTotalPatients(p => p + 1); setPatientsCount(p => p + 1);
      addToQueue('Patient', 'CREATE', tempId, payload);
      showToast(`Saved locally — will sync when connection is restored.`);
    }
  };

  const editPatient = async (id, details) => {
    const payload = { name: details.name, age: Number(details.age), gender: details.gender, phone: details.phone || null, address: details.address || null };
    if (!isOnline) {
      setPatientsList(p => p.map(pt => pt.id === id ? { ...pt, ...payload, status: 'Pending Sync' } : pt));
      addToQueue('Patient', 'UPDATE', id, payload);
      showToast('Patient updated locally — will sync when online.');
      return;
    }
    try {
      const updated    = await patientsApi.update(id, payload);
      const normalized = normalizePatient(updated);
      setPatientsList(p => p.map(pt => pt.id === id ? normalized : pt));
      showToast('Patient updated.');
    } catch (error) {
      setPatientsList(p => p.map(pt => pt.id === id ? { ...pt, ...payload, status: 'Pending Sync' } : pt));
      addToQueue('Patient', 'UPDATE', id, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  const deletePatient = async (id) => {
    setPatientsList(p => p.filter(pt => pt.id !== id));
    setTotalPatients(p => Math.max(0, p - 1)); setPatientsCount(p => Math.max(0, p - 1));
    if (!isOnline) { addToQueue('Patient', 'DELETE', id, {}); showToast('Deleted locally.'); return; }
    try {
      await patientsApi.remove(id);
      showToast('Patient deleted.');
    } catch {
      addToQueue('Patient', 'DELETE', id, {});
      showToast('Deleted locally — will sync when online.');
    }
  };

  // ── CONSULTATIONS ──────────────────────────────────────────────────────
  const addConsultation = async (details) => {
    const payload = { patient_id: details.patient_id, symptoms: details.symptoms || '', diagnosis: details.diagnosis, doctor_notes: details.doctorNotes || '' };
    const tempId  = `local_${Date.now()}`;

    if (!isOnline) {
      const patientObj = patientsList.find(p => p.id === details.patient_id);
      const localEntry = { id: tempId, patientId: details.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', symptoms: payload.symptoms, diagnosis: payload.diagnosis, doctorNotes: payload.doctor_notes, doctor: 'Dr. Anjali Sharma', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setConsultationsList(p => [localEntry, ...p]);
      setConsultationsCount(p => p + 1); setTodayVisits(p => p + 1);
      addToQueue('Consultation', 'CREATE', tempId, payload);
      showToast('Consultation saved locally — will sync when online.');
      return;
    }
    try {
      const created    = await consultationsApi.create(payload);
      const patientObj = patientsList.find(p => p.id === created.patient_id);
      const normalized = { id: created.id, patientId: created.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', symptoms: created.symptoms || '', diagnosis: created.diagnosis || '', doctorNotes: created.doctor_notes || '', doctor: 'Dr. Anjali Sharma', status: 'Synced', timestamp: new Date(created.created_at).toLocaleDateString('en-GB') };
      setConsultationsList(p => [normalized, ...p]);
      setConsultationsCount(p => p + 1); setTodayVisits(p => p + 1);
      showToast('Consultation saved.');
      await refreshSyncState();
    } catch (error) {
      const patientObj = patientsList.find(p => p.id === details.patient_id);
      const localEntry = { id: tempId, patientId: details.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', symptoms: payload.symptoms, diagnosis: payload.diagnosis, doctorNotes: payload.doctor_notes, doctor: 'Dr. Anjali Sharma', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setConsultationsList(p => [localEntry, ...p]);
      setConsultationsCount(p => p + 1); setTodayVisits(p => p + 1);
      addToQueue('Consultation', 'CREATE', tempId, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  const editConsultation = async (id, details) => {
    const payload = { symptoms: details.symptoms || '', diagnosis: details.diagnosis, doctor_notes: details.doctorNotes || '' };
    if (!isOnline) {
      setConsultationsList(p => p.map(c => c.id === id ? { ...c, ...details, status: 'Pending Sync' } : c));
      addToQueue('Consultation', 'UPDATE', id, payload);
      showToast('Updated locally — will sync when online.');
      return;
    }
    try {
      const updated    = await consultationsApi.update(id, payload);
      const patientObj = patientsList.find(p => p.id === updated.patient_id);
      const normalized = { id: updated.id, patientId: updated.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', symptoms: updated.symptoms || '', diagnosis: updated.diagnosis || '', doctorNotes: updated.doctor_notes || '', doctor: 'Dr. Anjali Sharma', status: 'Synced', timestamp: new Date(updated.created_at).toLocaleDateString('en-GB') };
      setConsultationsList(p => p.map(c => c.id === id ? normalized : c));
      showToast('Consultation updated.');
    } catch (error) {
      setConsultationsList(p => p.map(c => c.id === id ? { ...c, ...details, status: 'Pending Sync' } : c));
      addToQueue('Consultation', 'UPDATE', id, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  // ── PRESCRIPTIONS ──────────────────────────────────────────────────────
  const addPrescription = async (details) => {
    const payload = { consultation_id: details.consultationId, medicine_name: details.medicine, dosage: details.dosage, duration: details.duration || '' };
    const tempId  = `local_${Date.now()}`;
    if (!isOnline) {
      const consultationObj = consultationsList.find(c => c.id === details.consultationId);
      const localEntry = { id: tempId, consultationId: details.consultationId, patientName: consultationObj ? consultationObj.patientName : 'Unknown', medicine: details.medicine, dosage: details.dosage, duration: details.duration || '', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setPrescriptionsList(p => [localEntry, ...p]); setPrescriptionsCount(p => p + 1);
      addToQueue('Prescription', 'CREATE', tempId, payload);
      showToast('Prescription saved locally — will sync when online.');
      return;
    }
    try {
      const created         = await prescriptionsApi.create(payload);
      const consultationObj = consultationsList.find(c => c.id === created.consultation_id);
      const normalized      = { id: created.id, consultationId: created.consultation_id, patientName: consultationObj ? consultationObj.patientName : 'Unknown', medicine: created.medicine_name, dosage: created.dosage, duration: created.duration || '', status: 'Synced', timestamp: new Date(created.created_at).toLocaleDateString('en-GB') };
      setPrescriptionsList(p => [normalized, ...p]); setPrescriptionsCount(p => p + 1);
      showToast('Prescription saved.');
      await refreshSyncState();
    } catch (error) {
      const consultationObj = consultationsList.find(c => c.id === details.consultationId);
      const localEntry = { id: tempId, consultationId: details.consultationId, patientName: consultationObj ? consultationObj.patientName : 'Unknown', medicine: details.medicine, dosage: details.dosage, duration: details.duration || '', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setPrescriptionsList(p => [localEntry, ...p]); setPrescriptionsCount(p => p + 1);
      addToQueue('Prescription', 'CREATE', tempId, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  const editPrescription = async (id, details) => {
    const payload = { medicine_name: details.medicine, dosage: details.dosage, duration: details.duration || '' };
    if (!isOnline) {
      setPrescriptionsList(p => p.map(r => r.id === id ? { ...r, ...details, status: 'Pending Sync' } : r));
      addToQueue('Prescription', 'UPDATE', id, payload);
      showToast('Updated locally — will sync when online.');
      return;
    }
    try {
      const updated         = await prescriptionsApi.update(id, payload);
      const consultationObj = consultationsList.find(c => c.id === updated.consultation_id);
      const normalized      = { id: updated.id, consultationId: updated.consultation_id, patientName: consultationObj ? consultationObj.patientName : 'Unknown', medicine: updated.medicine_name, dosage: updated.dosage, duration: updated.duration || '', status: 'Synced', timestamp: new Date(updated.created_at).toLocaleDateString('en-GB') };
      setPrescriptionsList(p => p.map(r => r.id === id ? normalized : r));
      showToast('Prescription updated.');
    } catch (error) {
      setPrescriptionsList(p => p.map(r => r.id === id ? { ...r, ...details, status: 'Pending Sync' } : r));
      addToQueue('Prescription', 'UPDATE', id, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  // ── VACCINATIONS ───────────────────────────────────────────────────────
  const addVaccination = async (details) => {
    const payload = { patient_id: details.patient_id, vaccine_name: details.vaccine, vaccination_date: details.vaccinationDate, status: details.vacStatus || 'Administered' };
    const tempId  = `local_${Date.now()}`;
    if (!isOnline) {
      const patientObj = patientsList.find(p => p.id === details.patient_id);
      const localEntry = { id: tempId, patientId: details.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', vaccine: details.vaccine, batch: '', vaccinationDate: details.vaccinationDate, vacStatus: details.vacStatus || 'Administered', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setVaccinationsList(p => [localEntry, ...p]); setVaccinationsCount(p => p + 1);
      addToQueue('Vaccination', 'CREATE', tempId, payload);
      showToast('Vaccination saved locally — will sync when online.');
      return;
    }
    try {
      const created    = await vaccinationsApi.create(payload);
      const patientObj = patientsList.find(p => p.id === created.patient_id);
      const normalized = { id: created.id, patientId: created.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', vaccine: created.vaccine_name, batch: '', vaccinationDate: created.vaccination_date, vacStatus: created.status, status: 'Synced', timestamp: new Date(created.created_at).toLocaleDateString('en-GB') };
      setVaccinationsList(p => [normalized, ...p]); setVaccinationsCount(p => p + 1);
      showToast('Vaccination recorded.');
      await refreshSyncState();
    } catch (error) {
      const patientObj = patientsList.find(p => p.id === details.patient_id);
      const localEntry = { id: tempId, patientId: details.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', vaccine: details.vaccine, batch: '', vaccinationDate: details.vaccinationDate, vacStatus: details.vacStatus || 'Administered', status: 'Pending Sync', timestamp: new Date().toLocaleDateString('en-GB') };
      setVaccinationsList(p => [localEntry, ...p]); setVaccinationsCount(p => p + 1);
      addToQueue('Vaccination', 'CREATE', tempId, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  const editVaccination = async (id, details) => {
    const payload = { vaccine_name: details.vaccine, vaccination_date: details.vaccinationDate, status: details.vacStatus || 'Administered' };
    if (!isOnline) {
      setVaccinationsList(p => p.map(v => v.id === id ? { ...v, ...details, status: 'Pending Sync' } : v));
      addToQueue('Vaccination', 'UPDATE', id, payload);
      showToast('Updated locally — will sync when online.');
      return;
    }
    try {
      const updated    = await vaccinationsApi.update(id, payload);
      const patientObj = patientsList.find(p => p.id === updated.patient_id);
      const normalized = { id: updated.id, patientId: updated.patient_id, patientName: patientObj ? patientObj.name : 'Unknown', vaccine: updated.vaccine_name, batch: '', vaccinationDate: updated.vaccination_date, vacStatus: updated.status, status: 'Synced', timestamp: new Date(updated.created_at).toLocaleDateString('en-GB') };
      setVaccinationsList(p => p.map(v => v.id === id ? normalized : v));
      showToast('Vaccination updated.');
    } catch (error) {
      setVaccinationsList(p => p.map(v => v.id === id ? { ...v, ...details, status: 'Pending Sync' } : v));
      addToQueue('Vaccination', 'UPDATE', id, payload);
      showToast('Saved locally — will sync when online.');
    }
  };

  // ── SYNC ───────────────────────────────────────────────────────────────
  const performSync = async () => {
    if (isSyncing) return;
    if (!isOnline) { showToast('Cannot sync while offline'); return; }
    setIsSyncing(true);
    try {
      // First process any pending local queue
      await processPendingQueue();
      // Then trigger server-side sync
      const response = await syncApi.trigger();
      const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(ts);
      setSyncLogs(p => [{ id: p.length + 1, type: 'success', title: 'Sync completed', desc: response?.message || 'Sync completed.', time: ts }, ...p]);
      await refreshSyncState();
      showToast('Sync completed.');
    } catch (error) {
      showToast(error.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const retryFailed = async () => {
    // Retry failed local queue items first
    setPendingQueue(q => q.map(item => item.syncStatus === 'FAILED' ? { ...item, syncStatus: 'PENDING' } : item));
    if (isOnline) await processPendingQueue();
    try {
      const response = await syncApi.retryFailed();
      showToast(response?.message || 'Retry completed');
      await refreshSyncState();
    } catch (error) {
      showToast(error.message || 'Unable to retry sync');
    }
  };

  useEffect(() => {
    if (isOnline && !isSyncing) refreshSyncState();
  }, [isOnline, isSyncing]);


 

  // ── Auto-sync when backend comes back online ───────────────────────────
  useEffect(() => {
    if (isOnline) {
      const pending = pendingQueue.filter(q => q.syncStatus === 'PENDING');
      if (pending.length > 0 && !isSyncing) {
        showToast('Back online! Syncing pending records...');
        setTimeout(() => processPendingQueue(), 2000);
      }
    }
  }, [isOnline]);
  return (
    <SyncContext.Provider value={{
      currentUser, isOnline, pendingSync, lastSyncTime, totalPatients, todayVisits,
      patientsCount, consultationsCount, prescriptionsCount, vaccinationsCount,
      patientsList, consultationsList, prescriptionsList, vaccinationsList,
      syncLogs, syncQueue: pendingQueue, toast, isSyncing, isLoadingData, dataError, currentTime, currentDate,
      toggleConnection: () => {
        const next = !isOnline;
        setIsOnline(next);
        showToast(next ? 'System is now Online.' : 'System is now Offline. Changes will be saved locally.');
        if (next && pendingQueue.filter(q => q.syncStatus === 'PENDING').length > 0) {
          setTimeout(() => processPendingQueue(), 500);
        }
      },
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