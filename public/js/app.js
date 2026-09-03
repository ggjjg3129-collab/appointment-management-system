const state = {
  appointments: [],
  filters: {
    patient: '',
    doctor: '',
    status: '',
    date: ''
  }
};

const els = {
  pageTitle: document.getElementById('pageTitle'),
  totalAppointments: document.getElementById('totalAppointments'),
  todayAppointments: document.getElementById('todayAppointments'),
  pendingAppointments: document.getElementById('pendingAppointments'),
  completedAppointments: document.getElementById('completedAppointments'),
  cancelledAppointments: document.getElementById('cancelledAppointments'),
  appointmentTableBody: document.getElementById('appointmentTableBody'),
  appointmentForm: document.getElementById('appointmentForm'),
  formTitle: document.getElementById('formTitle'),
  appointmentId: document.getElementById('appointmentId'),
  newAppointmentBtn: document.getElementById('newAppointmentBtn'),
  cancelFormBtn: document.getElementById('cancelFormBtn'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  searchPatient: document.getElementById('searchPatient'),
  searchDoctor: document.getElementById('searchDoctor'),
  statusFilter: document.getElementById('statusFilter'),
  dateFilter: document.getElementById('dateFilter'),
  toast: document.getElementById('toast')
};

const views = {
  dashboard: document.getElementById('dashboardView'),
  appointments: document.getElementById('appointmentsView'),
  'new-appointment': document.getElementById('newAppointmentView')
};

const navButtons = document.querySelectorAll('.nav-link');

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    els.toast.classList.remove('show');
  }, 2500);
}

function setView(viewName) {
  Object.entries(views).forEach(([key, view]) => {
    view.classList.toggle('active', key === viewName);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });

  const labels = {
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    'new-appointment': 'New Appointment'
  };

  els.pageTitle.textContent = labels[viewName] || 'Dashboard';
}

function buildAppointmentRow(appointment) {
  const row = document.createElement('tr');
  const formattedDate = new Date(`${appointment.appointment_date}T00:00:00`).toLocaleDateString();
  const formattedTime = appointment.appointment_time ? new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  row.innerHTML = `
    <td>
      <div><strong>${escapeHtml(appointment.patient_name)}</strong></div>
      <small>${escapeHtml(appointment.patient_phone)}</small>
    </td>
    <td>${escapeHtml(appointment.doctor_name)}</td>
    <td>${escapeHtml(appointment.department)}</td>
    <td>${formattedDate}</td>
    <td>${formattedTime}</td>
    <td><span class="status-badge ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
    <td>
      <div class="actions">
        <button class="action-btn view" data-action="view" data-id="${appointment.id}">View</button>
        <button class="action-btn edit" data-action="edit" data-id="${appointment.id}">Edit</button>
        <button class="action-btn delete" data-action="delete" data-id="${appointment.id}">Delete</button>
      </div>
    </td>
  `;

  return row;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTable() {
  const filtered = state.appointments.filter((item) => {
    const patientMatch = !state.filters.patient || item.patient_name.toLowerCase().includes(state.filters.patient.toLowerCase());
    const doctorMatch = !state.filters.doctor || item.doctor_name.toLowerCase().includes(state.filters.doctor.toLowerCase());
    const statusMatch = !state.filters.status || item.status === state.filters.status;
    const dateMatch = !state.filters.date || item.appointment_date === state.filters.date;
    return patientMatch && doctorMatch && statusMatch && dateMatch;
  });

  if (filtered.length === 0) {
    els.appointmentTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No appointments found.</td></tr>';
    return;
  }

  els.appointmentTableBody.innerHTML = '';
  filtered.forEach((appointment) => {
    els.appointmentTableBody.appendChild(buildAppointmentRow(appointment));
  });
}

async function fetchDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) throw new Error('Unable to load dashboard stats');
    const data = await response.json();

    els.totalAppointments.textContent = data.total_appointments ?? 0;
    els.todayAppointments.textContent = data.today_appointments ?? 0;
    els.pendingAppointments.textContent = data.pending_appointments ?? 0;
    els.completedAppointments.textContent = data.completed_appointments ?? 0;
    els.cancelledAppointments.textContent = data.cancelled_appointments ?? 0;
  } catch (error) {
    console.error(error);
    showToast('Dashboard stats could not be loaded');
  }
}

async function fetchAppointments() {
  try {
    const params = new URLSearchParams();
    if (state.filters.patient) params.set('patient', state.filters.patient);
    if (state.filters.doctor) params.set('doctor', state.filters.doctor);
    if (state.filters.status) params.set('status', state.filters.status);
    if (state.filters.date) params.set('date', state.filters.date);

    const response = await fetch(`/api/appointments?${params.toString()}`);
    if (!response.ok) throw new Error('Unable to load appointments');
    const data = await response.json();
    state.appointments = data;
    renderTable();
  } catch (error) {
    console.error(error);
    showToast('Appointments could not be loaded');
  }
}

async function saveAppointment(event) {
  event.preventDefault();

  const appointmentId = els.appointmentId.value;
  const payload = {
    patient_name: document.getElementById('patient_name').value.trim(),
    patient_phone: document.getElementById('patient_phone').value.trim(),
    doctor_name: document.getElementById('doctor_name').value.trim(),
    department: document.getElementById('department').value,
    appointment_date: document.getElementById('appointment_date').value,
    appointment_time: document.getElementById('appointment_time').value,
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value.trim()
  };

  const endpoint = appointmentId ? `/api/appointments/${appointmentId}` : '/api/appointments';
  const method = appointmentId ? 'PUT' : 'POST';

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Could not save appointment');
    }

    showToast(appointmentId ? 'Appointment updated successfully' : 'Appointment created successfully');
    resetForm();
    setView('appointments');
    await fetchAppointments();
    await fetchDashboardStats();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Something went wrong');
  }
}

async function deleteAppointment(id) {
  if (!window.confirm('Delete this appointment?')) {
    return;
  }

  try {
    const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Delete failed');
    }

    showToast('Appointment deleted');
    await fetchAppointments();
    await fetchDashboardStats();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Delete failed');
  }
}

function populateForm(appointment) {
  els.appointmentId.value = appointment.id;
  document.getElementById('patient_name').value = appointment.patient_name;
  document.getElementById('patient_phone').value = appointment.patient_phone;
  document.getElementById('doctor_name').value = appointment.doctor_name;
  document.getElementById('department').value = appointment.department;
  document.getElementById('appointment_date').value = appointment.appointment_date;
  document.getElementById('appointment_time').value = appointment.appointment_time;
  document.getElementById('status').value = appointment.status;
  document.getElementById('notes').value = appointment.notes || '';
  els.formTitle.textContent = 'Edit Appointment';
  setView('new-appointment');
}

function resetForm() {
  els.appointmentForm.reset();
  els.appointmentId.value = '';
  els.formTitle.textContent = 'Create Appointment';
}

async function handleRowAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === 'delete') {
    await deleteAppointment(id);
    return;
  }

  if (action === 'edit') {
    const appointment = state.appointments.find((item) => String(item.id) === String(id));
    if (appointment) populateForm(appointment);
    return;
  }

  if (action === 'view') {
    const appointment = state.appointments.find((item) => String(item.id) === String(id));
    if (!appointment) return;
    window.alert(
      `Patient: ${appointment.patient_name}\nDoctor: ${appointment.doctor_name}\nDate: ${appointment.appointment_date}\nTime: ${appointment.appointment_time}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || 'No notes'}`
    );
  }
}

function attachEvents() {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const viewName = button.dataset.view;
      setView(viewName);
      if (viewName === 'appointments') {
        fetchAppointments();
      }
    });
  });

  els.newAppointmentBtn.addEventListener('click', () => {
    resetForm();
    setView('new-appointment');
  });

  els.cancelFormBtn.addEventListener('click', () => {
    resetForm();
    setView('appointments');
  });

  els.appointmentForm.addEventListener('submit', saveAppointment);
  els.appointmentTableBody.addEventListener('click', handleRowAction);

  ['searchPatient', 'searchDoctor', 'statusFilter', 'dateFilter'].forEach((key) => {
    const element = els[key];
    if (!element) return;
    element.addEventListener('input', () => {
      state.filters.patient = els.searchPatient.value.trim();
      state.filters.doctor = els.searchDoctor.value.trim();
      state.filters.status = els.statusFilter.value;
      state.filters.date = els.dateFilter.value;
      fetchAppointments();
    });
  });

  els.clearFiltersBtn.addEventListener('click', () => {
    state.filters = { patient: '', doctor: '', status: '', date: '' };
    els.searchPatient.value = '';
    els.searchDoctor.value = '';
    els.statusFilter.value = '';
    els.dateFilter.value = '';
    fetchAppointments();
  });
}

async function init() {
  attachEvents();
  setView('dashboard');
  await fetchDashboardStats();
  await fetchAppointments();
}

init();
