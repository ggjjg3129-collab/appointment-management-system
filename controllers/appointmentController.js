const { pool } = require('../config/database');

function normalizeAppointmentRecord(row) {
  return {
    id: row.id,
    patient_name: row.patient_name,
    patient_phone: row.patient_phone,
    doctor_name: row.doctor_name,
    appointment_date: row.appointment_date,
    appointment_time: row.appointment_time,
    department: row.department,
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getAllAppointments(req, res) {
  try {
    const { status, doctor, patient, date } = req.query;

    let query = 'SELECT * FROM appointments';
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push('status = ?');
      values.push(status);
    }

    if (doctor) {
      conditions.push('doctor_name LIKE ?');
      values.push(`%${doctor}%`);
    }

    if (patient) {
      conditions.push('patient_name LIKE ?');
      values.push(`%${patient}%`);
    }

    if (date) {
      conditions.push('appointment_date = ?');
      values.push(date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY appointment_date DESC, appointment_time DESC';

    const [rows] = await pool.query(query, values);
    res.json(rows.map(normalizeAppointmentRecord));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
}

async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.json(normalizeAppointmentRecord(rows[0]));
  } catch (error) {
    console.error('Error fetching appointment by id:', error);
    return res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
}

async function createAppointment(req, res) {
  try {
    const {
      patient_name,
      patient_phone,
      doctor_name,
      appointment_date,
      appointment_time,
      department,
      status = 'Pending',
      notes
    } = req.body;

    if (!patient_name || !patient_phone || !doctor_name || !appointment_date || !appointment_time || !department) {
      return res.status(400).json({ message: 'Please provide all required appointment fields' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (
        patient_name,
        patient_phone,
        doctor_name,
        appointment_date,
        appointment_time,
        department,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, patient_phone, doctor_name, appointment_date, appointment_time, department, status, notes || '']
    );

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment: normalizeAppointmentRecord(rows[0])
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
}

async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const {
      patient_name,
      patient_phone,
      doctor_name,
      appointment_date,
      appointment_time,
      department,
      status,
      notes
    } = req.body;

    const [existingRows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const existing = existingRows[0];

    const updatedData = {
      patient_name: patient_name || existing.patient_name,
      patient_phone: patient_phone || existing.patient_phone,
      doctor_name: doctor_name || existing.doctor_name,
      appointment_date: appointment_date || existing.appointment_date,
      appointment_time: appointment_time || existing.appointment_time,
      department: department || existing.department,
      status: status || existing.status,
      notes: notes !== undefined ? notes : existing.notes
    };

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(updatedData.status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }

    await pool.query(
      `UPDATE appointments SET
        patient_name = ?,
        patient_phone = ?,
        doctor_name = ?,
        appointment_date = ?,
        appointment_time = ?,
        department = ?,
        status = ?,
        notes = ?
      WHERE id = ?`,
      [
        updatedData.patient_name,
        updatedData.patient_phone,
        updatedData.doctor_name,
        updatedData.appointment_date,
        updatedData.appointment_time,
        updatedData.department,
        updatedData.status,
        updatedData.notes,
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    return res.json({
      message: 'Appointment updated successfully',
      appointment: normalizeAppointmentRecord(rows[0])
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
}

async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total_appointments,
        SUM(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 ELSE 0 END) AS today_appointments,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_appointments,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_appointments,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_appointments
      FROM appointments
    `);

    const stats = rows[0] || {};
    res.json({
      total_appointments: Number(stats.total_appointments || 0),
      today_appointments: Number(stats.today_appointments || 0),
      pending_appointments: Number(stats.pending_appointments || 0),
      completed_appointments: Number(stats.completed_appointments || 0),
      cancelled_appointments: Number(stats.cancelled_appointments || 0)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDashboardStats
};
