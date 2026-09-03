const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'appointment_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('MySQL connected successfully');
    return rows;
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection
};
