import { useSync } from '../context/useSyncContext';
import { RefreshCw, CheckCircle, Wifi, WifiOff, Database, AlertTriangle, List, RotateCcw } from 'lucide-react';

const SyncCenter = () => {
  const {
    isOnline, pendingSync, lastSyncTime,
    toggleConnection, performSync, retryFailed,
    isSyncing, syncLogs, syncQueue
  } = useSync();

  const syncProgress = pendingSync === 0 ? 100 : Math.round((1 - pendingSync / (pendingSync + 10)) * 100);

  const statusStyle = {
    Pending: { color:'var(--color-orange)', bg:'var(--color-orange-light)' },
    Synced:  { color:'var(--color-green)',  bg:'var(--color-green-light)'  },
    Failed:  { color:'var(--color-red)',    bg:'var(--color-red-light)'    },
  };

  const opStyle = {
    CREATE: { color:'var(--color-blue)',   bg:'var(--color-blue-light)'   },
    UPDATE: { color:'var(--color-amber)',  bg:'var(--color-amber-light)'  },
    DELETE: { color:'var(--color-red)',    bg:'var(--color-red-light)'    },
  };

  const failedCount = (syncQueue || []).filter(q => q.syncStatus === 'Failed').length;

  return (
    <div className="dashboard-body">
      <div className="page-title-box">
        <h2>Sync Center</h2>
      </div>

      <div className="core-grid">
        <div className="left-column">

          {/* Status Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="header-with-icon">
                <Database size={16} className="icon-blue"/>
                <h3>Database Synchronization Status</h3>
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize:'14px', color:'var(--text-muted)', marginBottom:'18px', lineHeight:1.6 }}>
                ArogyaSync uses an <strong style={{ color:'var(--text-main)' }}>offline-first</strong> local database.
                Records added while offline are queued and uploaded automatically when a connection is detected.
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                  <span style={{ fontWeight:500 }}>Local Database Integrity</span>
                  <span style={{ fontWeight:600, color:'var(--color-green)' }}>100% Healthy</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginTop:'6px' }}>
                  <span style={{ color:'var(--text-muted)' }}>Synchronization Completeness</span>
                  <span style={{ fontWeight:600 }}>{syncProgress}%</span>
                </div>
                <div className="sync-progress-bar-wrapper">
                  <div className="sync-progress-bar-fill" style={{ width:`${syncProgress}%` }}/>
                </div>
                {pendingSync > 0 && (
                  <p style={{ fontSize:'12px', color:'var(--color-orange)', display:'flex', alignItems:'center', gap:'5px' }}>
                    <AlertTriangle size={12}/> {pendingSync} record{pendingSync!==1?'s':''} pending upload
                  </p>
                )}
              </div>

              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <button className="primary-btn" onClick={performSync} disabled={isSyncing} style={{ minWidth:'150px' }}>
                  <RefreshCw size={15} className={isSyncing?'spinning':''}/><span>{isSyncing?'Syncing…':'Sync Now'}</span>
                </button>
                <button className="cancel-btn" onClick={toggleConnection} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  {isOnline ? <WifiOff size={15}/> : <Wifi size={15}/>}
                  <span>{isOnline ? 'Simulate Offline' : 'Simulate Online'}</span>
                </button>
                {failedCount > 0 && (
                  <button className="cancel-btn" onClick={retryFailed} style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--color-red)', borderColor:'rgba(229,62,62,0.3)' }}>
                    <RotateCcw size={15}/><span>Retry Failed ({failedCount})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sync Queue */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="header-with-icon">
                <List size={16} className="icon-orange"/>
                <h3>Sync Queue</h3>
              </div>
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--color-orange)', background:'var(--color-orange-light)', padding:'3px 10px', borderRadius:'20px' }}>
                {pendingSync} pending
              </span>
            </div>
            <div className="card-body" style={{ padding:'0 22px 22px' }}>
              {(!syncQueue || syncQueue.length === 0) ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-light)', fontSize:'14px' }}>
                  <CheckCircle size={28} style={{ color:'var(--color-green)', margin:'0 auto 10px', display:'block' }}/>
                  Queue is empty — all records are synced.
                </div>
              ) : (
                <div style={{ marginTop:'14px' }}>
                  {/* Table header */}
                  <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1.5fr 1fr', gap:'8px', padding:'8px 14px', background:'var(--bg-body)', borderRadius:'8px', fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>
                    <span>Entity Type</span><span>Operation</span><span>Status</span><span>Timestamp</span><span>Error</span>
                  </div>
                  {/* Rows */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {syncQueue.map((q, i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1.5fr 1fr', gap:'8px', padding:'10px 14px', background:'#fff', border:'1px solid var(--border-color)', borderRadius:'9px', fontSize:'13px', alignItems:'center', transition:'background 0.18s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f8fbfd'}
                        onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                      >
                        <span style={{ fontWeight:500 }}>{q.entityType}</span>
                        <span>
                          <span style={{ background:(opStyle[q.operation]||{}).bg||'#e2e8f0', color:(opStyle[q.operation]||{}).color||'var(--text-muted)', padding:'2px 9px', borderRadius:'5px', fontSize:'11.5px', fontWeight:600 }}>
                            {q.operation}
                          </span>
                        </span>
                        <span>
                          <span style={{ color:(statusStyle[q.syncStatus]||{}).color||'var(--text-muted)', fontWeight:600, fontSize:'12px' }}>
                            {q.syncStatus}
                          </span>
                        </span>
                        <span style={{ color:'var(--text-muted)', fontSize:'12px' }}>{q.timestamp}</span>
                        <span style={{ color:'var(--color-red)', fontSize:'12px' }}>{q.errorMessage||'—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sync Log History */}
          <div className="dashboard-card">
            <div className="card-header"><h3>Synchronization Log History</h3></div>
            <div className="card-body" style={{ padding:'0 22px 22px' }}>
              <div className="sync-logs-list">
                {syncLogs.map(log => (
                  <div key={log.id} className="sync-log-item">
                    <div className="log-left">
                      <div className={`log-icon ${log.type==='error'?'error':''}`}>
                        {log.type==='error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                      </div>
                      <div>
                        <span className="log-title">{log.title}</span>
                        <span className="log-desc">{log.desc}</span>
                      </div>
                    </div>
                    <span className="log-time">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="dashboard-card sync-overview-card">
            <div className="card-header"><h3>Connection Status</h3></div>
            <div className="card-body">
              <div style={{ textAlign:'center', padding:'20px 0 18px' }}>
                <div style={{
                  width:64, height:64, borderRadius:'50%',
                  background: isOnline ? 'var(--color-green-light)' : 'var(--color-red-light)',
                  border: `2px solid ${isOnline ? 'var(--color-green)' : 'var(--color-red)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px'
                }}>
                  {isOnline
                    ? <Wifi size={28} style={{ color:'var(--color-green)' }}/>
                    : <WifiOff size={28} style={{ color:'var(--color-red)' }}/>
                  }
                </div>
                <p style={{ fontWeight:700, fontSize:'16px', color:'var(--text-main)' }}>{isOnline ? 'Connected' : 'Offline'}</p>
                <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>
                  {isOnline ? 'Data syncs automatically' : 'Records saved locally'}
                </p>
              </div>

              <div className="sync-info-list" style={{ marginBottom:'16px' }}>
                <div className="sync-info-row">
                  <span className="info-label">Queue Length</span>
                  <span className="info-value bold" style={{ color: pendingSync>0 ? 'var(--color-orange)' : 'var(--color-green)' }}>
                    {pendingSync} Records
                  </span>
                </div>
                <div className="sync-info-row">
                  <span className="info-label">Last Sync</span>
                  <span className="info-value">{lastSyncTime}</span>
                </div>
                <div className="sync-info-row">
                  <span className="info-label">Sync Health</span>
                  <span style={{ fontWeight:700, color:'var(--color-green)', fontSize:'13px' }}>{syncProgress}%</span>
                </div>
                {failedCount > 0 && (
                  <div className="sync-info-row">
                    <span className="info-label">Failed Records</span>
                    <span style={{ fontWeight:700, color:'var(--color-red)', fontSize:'13px' }}>{failedCount}</span>
                  </div>
                )}
              </div>

              <button className="primary-sync-btn" onClick={performSync} disabled={isSyncing}>
                <RefreshCw size={15} className={isSyncing?'spinning':''}/><span>{isSyncing?'Syncing…':'Sync Now'}</span>
              </button>

              {failedCount > 0 && (
                <button onClick={retryFailed} style={{
                  marginTop:'10px', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
                  background:'var(--color-red-light)', color:'var(--color-red)', border:'1px solid rgba(229,62,62,0.25)',
                  borderRadius:'10px', padding:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit'
                }}>
                  <RotateCcw size={14}/> Retry {failedCount} Failed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncCenter;