import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Basic env check (won’t stop the app, just warns)
for (const key of ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME"]) {
  if (!process.env[key]) console.warn(`[env] ${key} is missing`);
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: quick connectivity test for startup logs
export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
