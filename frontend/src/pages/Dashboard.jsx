import Chart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';
import { useSync } from '../context/useSyncContext';
import { 
  Users, 
  Stethoscope, 
  RefreshCw, 
  Clock, 
  ArrowUpRight, 
  Calendar, 
  ChevronDown, 
  User, 
  Pill, 
  Syringe, 
  Activity, 
  BarChart3,
  UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    isOnline,
    pendingSync,
    lastSyncTime,
    totalPatients,
    todayVisits,
    patientsCount,
    consultationsCount,
    prescriptionsCount,
    vaccinationsCount,
    patientsList,
    consultationsList,
    prescriptionsList,
    vaccinationsList,
    performSync,
    isSyncing,
    showToast,
    isLoadingData,
    dataError
  } = useSync();

  const handleQuickAction = (type) => {
    if (isLoadingData) {
      showToast('Loading live records from the server. Please wait.', 'success');
      return;
    }

    if (dataError) {
      showToast('Live data is currently unavailable. Please retry once the backend is reachable.', 'error');
      return;
    }

    if (type === 'patient') {
      navigate('/patients');
      return;
    }

    if (type === 'consultation') {
      if (patientsList.length === 0) {
        showToast('No patients are available yet. Create patient data first.', 'error');
        return;
      }
      navigate('/consultations');
      return;
    }

    if (type === 'prescription') {
      if (consultationsList.length === 0) {
        showToast('No consultations are available yet. Create a consultation first.', 'error');
        return;
      }
      navigate('/prescriptions');
      return;
    }

    if (type === 'vaccination') {
      if (patientsList.length === 0) {
        showToast('No patients are available yet. Create patient data first.', 'error');
        return;
      }
      navigate('/vaccinations');
    }
  };

  const getQuickActionState = (type) => {
    if (isLoadingData) {
      return { disabled: true, hint: 'Loading live records…' };
    }

    if (dataError) {
      return { disabled: true, hint: 'Live data unavailable' };
    }

    if (type === 'consultation' && patientsList.length === 0) {
      return { disabled: true, hint: 'Create a patient first' };
    }

    if (type === 'prescription' && consultationsList.length === 0) {
      return { disabled: true, hint: 'Create a consultation first' };
    }

    if (type === 'vaccination' && patientsList.length === 0) {
      return { disabled: true, hint: 'Create a patient first' };
    }

    return { disabled: false, hint: 'Opens the live records screen' };
  };

  // Sparkline Chart configs
  const getSparklineConfig = (color) => ({
    chart: {
      type: 'area',
      height: 120,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    colors: [color],
    tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
  });

  // Trend Chart configs
  const getTrendLineConfig = (color, minMax = {}) => ({
    chart: {
      type: 'line',
      height: '100%',
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 600 }
    },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
    colors: [color],
    tooltip: { x: { show: false } },
    ...minMax
  });

  // Calculate dynamic distributions from real backend lists
  const maleCount = patientsList.filter(p => p.gender === 'Male').length;
  const femaleCount = patientsList.filter(p => p.gender === 'Female').length;
  const otherCount = patientsList.filter(p => p.gender !== 'Male' && p.gender !== 'Female').length;
  const totalGender = maleCount + femaleCount + otherCount;
  
  const malePercent = totalGender ? Math.round((maleCount / totalGender) * 100) : 0;
  const femalePercent = totalGender ? Math.round((femaleCount / totalGender) * 100) : 0;
  const otherPercent = totalGender ? Math.round((otherCount / totalGender) * 100) : 0;

  const age0_18 = patientsList.filter(p => Number(p.age) <= 18).length;
  const age19_40 = patientsList.filter(p => Number(p.age) > 18 && Number(p.age) <= 40).length;
  const age41_60 = patientsList.filter(p => Number(p.age) > 40 && Number(p.age) <= 60).length;
  const age60Plus = patientsList.filter(p => Number(p.age) > 60).length;
  const totalAge = age0_18 + age19_40 + age41_60 + age60Plus;

  const age0_18_Percent = totalAge ? Math.round((age0_18 / totalAge) * 100) : 0;
  const age19_40_Percent = totalAge ? Math.round((age19_40 / totalAge) * 100) : 0;
  const age41_60_Percent = totalAge ? Math.round((age41_60 / totalAge) * 100) : 0;
  const age60Plus_Percent = totalAge ? Math.round((age60Plus / totalAge) * 100) : 0;

  // Top Diagnoses distribution
  const diagnosesCounts = {};
  consultationsList.forEach(c => {
    const d = c.diagnosis || 'General Checkup';
    diagnosesCounts[d] = (diagnosesCounts[d] || 0) + 1;
  });
  const sortedDiagnoses = Object.entries(diagnosesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const diagnosesCategories = sortedDiagnoses.length ? sortedDiagnoses.map(x => x[0]) : ['No Data'];
  const diagnosesData = sortedDiagnoses.length ? sortedDiagnoses.map(x => x[1]) : [0];

  // Top Medicine usage distribution
  const medicineCounts = {};
  prescriptionsList.forEach(p => {
    const m = p.medicine || 'Unknown';
    medicineCounts[m] = (medicineCounts[m] || 0) + 1;
  });
  const sortedMedicines = Object.entries(medicineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const medicinesCategories = sortedMedicines.length ? sortedMedicines.map(x => x[0]) : ['No Data'];
  const medicinesData = sortedMedicines.length ? sortedMedicines.map(x => x[1]) : [0];

  // Historical 7 days daily trends
  const get7DaysTrend = (list) => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB'); // "DD/MM/YYYY"
      const count = list.filter(item => item.timestamp === dateStr).length;
      result.push(count);
    }
    return result;
  };

  const patientsTrend = get7DaysTrend(patientsList);
  const consultationsTrend = get7DaysTrend(consultationsList);
  const prescriptionsTrend = get7DaysTrend(prescriptionsList);
  const vaccinationsTrend = get7DaysTrend(vaccinationsList);

  return (
    <div className="dashboard-body">
      {/* Stats Row */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <Users />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Patients</span>
            <div className="stat-number-wrapper">
              <span className="stat-number">{totalPatients.toLocaleString()}</span>
              <span className="trend-badge green">
                <ArrowUpRight />
                <span>12%</span>
              </span>
            </div>
            <span className="stat-sub">All time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Stethoscope />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Visits</span>
            <div className="stat-number-wrapper">
              <span className="stat-number">{todayVisits}</span>
              <span className="trend-badge green">
                <ArrowUpRight />
                <span>8%</span>
              </span>
            </div>
            <span className="stat-sub">Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <RefreshCw />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Sync</span>
            <div className="stat-number-wrapper">
              <span className="stat-number">{pendingSync}</span>
            </div>
            <span className="stat-sub">Records</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Clock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Last Sync Time</span>
            <div className="stat-number-wrapper">
              <span className="stat-number">{lastSyncTime}</span>
            </div>
            <span className="stat-sub">Today</span>
          </div>
        </div>
      </section>

      {/* Core Grid */}
      <div className="core-grid">
        {/* Left Column (Overview & Charts) */}
        <div className="left-column">
          {/* Module-wise Summary Card */}
          <div className="dashboard-card module-summary-card">
            <div className="card-header">
              <h3>Overview (Module-wise Summary)</h3>
              <div className="dropdown-filter">
                <Calendar className="dropdown-icon" />
                <span>Today</span>
                <ChevronDown className="chevron-icon" />
              </div>
            </div>
            <div className="card-body module-charts-grid">
              
              {/* Patient Details Mini Chart */}
              <div className="module-chart-box">
                <div className="module-header">
                  <div className="module-title">
                    <User className="icon-green" />
                    <div>
                      <h4>Patient Details</h4>
                      <span>New Patients Today</span>
                    </div>
                  </div>
                  <span className="module-value">{patientsCount}</span>
                </div>
                <Chart 
                  options={getSparklineConfig('#10b981')} 
                  series={[{ name: 'New Patients', data: patientsTrend }]} 
                  type="area" 
                  className="mini-chart"
                />
              </div>

              {/* Consultations Mini Chart */}
              <div className="module-chart-box">
                <div className="module-header">
                  <div className="module-title">
                    <Stethoscope className="icon-blue" />
                    <div>
                      <h4>Consultations</h4>
                      <span>Today</span>
                    </div>
                  </div>
                  <span className="module-value">{consultationsCount}</span>
                </div>
                <Chart 
                  options={getSparklineConfig('#3b82f6')} 
                  series={[{ name: 'Consultations', data: consultationsTrend }]} 
                  type="area" 
                  className="mini-chart"
                />
              </div>

              {/* Prescriptions Mini Chart */}
              <div className="module-chart-box">
                <div className="module-header">
                  <div className="module-title">
                    <Pill className="icon-orange" />
                    <div>
                      <h4>Prescriptions</h4>
                      <span>Today</span>
                    </div>
                  </div>
                  <span className="module-value">{prescriptionsCount}</span>
                </div>
                <Chart 
                  options={getSparklineConfig('#f97316')} 
                  series={[{ name: 'Prescriptions', data: prescriptionsTrend }]} 
                  type="area" 
                  className="mini-chart"
                />
              </div>

              {/* Vaccinations Mini Chart */}
              <div className="module-chart-box">
                <div className="module-header">
                  <div className="module-title">
                    <Syringe className="icon-purple" />
                    <div>
                      <h4>Vaccinations</h4>
                      <span>Today</span>
                    </div>
                  </div>
                  <span className="module-value">{vaccinationsCount}</span>
                </div>
                <Chart 
                  options={getSparklineConfig('#8b5cf6')} 
                  series={[{ name: 'Vaccinations', data: vaccinationsTrend }]} 
                  type="area" 
                  className="mini-chart"
                />
              </div>
            </div>
          </div>

          {/* Middle Charts Grid: Donuts & Bars */}
          <div className="middle-charts-grid">
            
            {/* Patients by Gender */}
            <div className="dashboard-card distribution-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Users className="icon-green" />
                  <h3>Patients by Gender</h3>
                </div>
              </div>
              <div className="card-body flex-row">
                <Chart 
                  options={{
                    chart: { type: 'donut', height: 120, width: 120, sparkline: { enabled: true } },
                    colors: ['#3b82f6', '#8b5cf6', '#94a3b8'],
                    labels: ['Male', 'Female', 'Other'],
                    plotOptions: { pie: { donut: { size: '70%', labels: { show: false } } } },
                    dataLabels: { enabled: false },
                    tooltip: { enabled: true }
                  }}
                  series={totalGender ? [maleCount, femaleCount, otherCount] : [0, 0, 0]}
                  type="donut"
                  className="donut-chart-container"
                />
                <div className="donut-legend">
                  <div className="legend-item">
                    <span className="legend-dot male"></span>
                    <div className="legend-info">
                      <span className="legend-label">Male</span>
                      <span className="legend-val">{maleCount} <span className="percent">({malePercent}%)</span></span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot female"></span>
                    <div className="legend-info">
                      <span className="legend-label">Female</span>
                      <span className="legend-val">{femaleCount} <span className="percent">({femalePercent}%)</span></span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot other"></span>
                    <div className="legend-info">
                      <span className="legend-label">Other</span>
                      <span className="legend-val">{otherCount} <span className="percent">({otherPercent}%)</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Age Group Distribution */}
            <div className="dashboard-card distribution-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <BarChart3 className="icon-blue" />
                  <h3>Age Group Distribution</h3>
                </div>
              </div>
              <div className="card-body flex-row">
                <Chart 
                  options={{
                    chart: { type: 'donut', height: 120, width: 120, sparkline: { enabled: true } },
                    colors: ['#10b981', '#3b82f6', '#f97316', '#8b5cf6'],
                    labels: ['0-18', '19-40', '41-60', '60+'],
                    plotOptions: { pie: { donut: { size: '70%', labels: { show: false } } } },
                    dataLabels: { enabled: false },
                    tooltip: { enabled: true }
                  }}
                  series={totalAge ? [age0_18, age19_40, age41_60, age60Plus] : [0, 0, 0, 0]}
                  type="donut"
                  className="donut-chart-container"
                />
                <div className="donut-legend scrollable">
                  <div className="legend-item">
                    <span className="legend-dot age1"></span>
                    <div className="legend-info">
                      <span className="legend-label">0-18</span>
                      <span className="legend-val">{age0_18} <span className="percent">({age0_18_Percent}%)</span></span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot age2"></span>
                    <div className="legend-info">
                      <span className="legend-label">19-40</span>
                      <span className="legend-val">{age19_40} <span className="percent">({age19_40_Percent}%)</span></span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot age3"></span>
                    <div className="legend-info">
                      <span className="legend-label">41-60</span>
                      <span className="legend-val">{age41_60} <span className="percent">({age41_60_Percent}%)</span></span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot age4"></span>
                    <div className="legend-info">
                      <span className="legend-label">60+</span>
                      <span className="legend-val">{age60Plus} <span className="percent">({age60Plus_Percent}%)</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="dashboard-card horizontal-bar-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Activity className="icon-orange" />
                  <h3>Top Diagnoses</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={{
                    chart: { type: 'bar', height: 140, toolbar: { show: false } },
                    colors: ['#14b8a6'],
                    plotOptions: {
                      bar: {
                        horizontal: true,
                        barHeight: '65%',
                        borderRadius: 4,
                        dataLabels: { position: 'end' }
                      }
                    },
                    dataLabels: {
                      enabled: true,
                      offsetX: 12,
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        colors: ['#334155']
                      }
                    },
                    grid: {
                      show: false,
                      padding: {
                        top: 0,
                        bottom: 0,
                        left: 40,
                        right: 10
                      }
                    },
                    xaxis: {
                      categories: diagnosesCategories,
                      labels: { show: false },
                      axisBorder: { show: false },
                      axisTicks: { show: false }
                    },
                    yaxis: {
                      labels: {
                        maxWidth: 140,
                        style: {
                          fontSize: '11px',
                          fontWeight: 500,
                          colors: '#475569'
                        }
                      }
                    }
                  }}
                  series={[{ name: 'Cases', data: diagnosesData }]}
                  type="bar"
                  height={140}
                />
              </div>
            </div>

            {/* Medicine Usage */}
            <div className="dashboard-card horizontal-bar-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Pill className="icon-purple" />
                  <h3>Medicine Usage</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={{
                    chart: { type: 'bar', height: 140, toolbar: { show: false } },
                    colors: ['#8b5cf6'],
                    plotOptions: {
                      bar: {
                        horizontal: true,
                        barHeight: '65%',
                        borderRadius: 4,
                        dataLabels: { position: 'end' }
                      }
                    },
                    dataLabels: {
                      enabled: true,
                      offsetX: 12,
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        colors: ['#334155']
                      }
                    },
                    grid: {
                      show: false,
                      padding: {
                        top: 0,
                        bottom: 0,
                        left: 60,
                        right: 10
                      }
                    },
                    xaxis: {
                      categories: medicinesCategories,
                      labels: { show: false },
                      axisBorder: { show: false },
                      axisTicks: { show: false }
                    },
                    yaxis: {
                      labels: {
                        maxWidth: 150,
                        style: {
                          fontSize: '11px',
                          fontWeight: 500,
                          colors: '#475569'
                        }
                      }
                    }
                  }}
                  series={[{ name: 'Units Given', data: medicinesData }]}
                  type="bar"
                  height={140}
                />
              </div>
            </div>
          </div>

          {/* Bottom Trend Charts Grid */}
          <div className="bottom-trends-grid">
            {/* Consultations Trend */}
            <div className="dashboard-card trend-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Stethoscope className="icon-blue" />
                  <h3>Consultations Trend</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={getTrendLineConfig('#3b82f6')} 
                  series={[{ name: 'Consultations', data: consultationsTrend }]} 
                  type="line"
                  height={110}
                />
              </div>
            </div>

            {/* Prescriptions Trend */}
            <div className="dashboard-card trend-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Pill className="icon-orange" />
                  <h3>Prescriptions Trend</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={getTrendLineConfig('#f97316')} 
                  series={[{ name: 'Prescriptions', data: prescriptionsTrend }]} 
                  type="line"
                  height={110}
                />
              </div>
            </div>

            {/* Vaccinations Trend */}
            <div className="dashboard-card trend-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <Syringe className="icon-purple" />
                  <h3>Vaccinations Trend</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={getTrendLineConfig('#8b5cf6')} 
                  series={[{ name: 'Vaccinations', data: vaccinationsTrend }]} 
                  type="line"
                  height={110}
                />
              </div>
            </div>

            {/* Sync Status Trend */}
            <div className="dashboard-card trend-card">
              <div className="card-header borderless">
                <div className="header-with-icon">
                  <RefreshCw className="icon-green" />
                  <h3>Sync Status Trend</h3>
                </div>
              </div>
              <div className="card-body">
                <Chart 
                  options={getTrendLineConfig('#10b981', { yaxis: { min: 0, max: 100 } })} 
                  series={[{ name: 'Sync Health', data: [75, 88, 82, 94, 90, 98, pendingSync === 0 ? 100 : 92] }]} 
                  type="line"
                  height={110}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions & Sync Overview) */}
        <div className="right-column">
          {/* Quick Actions Card */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="actions-grid">
                <button className="action-btn green" onClick={() => handleQuickAction('patient')} disabled={getQuickActionState('patient').disabled}>
                  <UserPlus />
                  <span>Add Patient</span>
                </button>
                <button className="action-btn blue" onClick={() => handleQuickAction('consultation')} disabled={getQuickActionState('consultation').disabled}>
                  <Stethoscope />
                  <span>New Consultation</span>
                </button>
                <button className="action-btn orange" onClick={() => handleQuickAction('prescription')} disabled={getQuickActionState('prescription').disabled}>
                  <Pill />
                  <span>Add Prescription</span>
                </button>
                <button className="action-btn purple" onClick={() => handleQuickAction('vaccination')} disabled={getQuickActionState('vaccination').disabled}>
                  <Syringe />
                  <span>Add Vaccination</span>
                </button>
              </div>

              <div style={{ marginTop:'12px', fontSize:'13px', color:'var(--text-muted)' }}>
                {dataError ? (
                  <span>Live data unavailable: {dataError}</span>
                ) : isLoadingData ? (
                  <span>Loading live records from the backend…</span>
                ) : (
                  <span></span>
                )}
              </div>
              
              <button 
                className="quick-sync-btn" 
                onClick={performSync}
                disabled={isSyncing}
              >
                <div className="btn-left">
                  <RefreshCw className={isSyncing ? 'spinning' : ''} />
                  <div className="btn-text">
                    <h4>{isSyncing ? 'Syncing...' : 'Sync Now'}</h4>
                    <span>Upload pending records</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sync Overview Card */}
          <div className="dashboard-card sync-overview-card">
            <div className="card-header">
              <h3>Sync Overview</h3>
            </div>
            <div className="card-body">
              <div className="sync-info-list">
                <div className="sync-info-row">
                  <span className="info-label">Pending Records</span>
                  <span className="info-value bold">{pendingSync}</span>
                </div>
                <div className="sync-info-row">
                  <span className="info-label">Last Sync Time</span>
                  <span className="info-value">{lastSyncTime}</span>
                </div>
                <div className="sync-info-row">
                  <span className="info-label">Connection Status</span>
                  <span className={`status-pill ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>

              <button 
                className="primary-sync-btn" 
                onClick={performSync}
                disabled={isSyncing}
              >
                <RefreshCw className={isSyncing ? 'spinning' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              
              <div className="sync-footer">
                <span>Last successful sync: {lastSyncTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
