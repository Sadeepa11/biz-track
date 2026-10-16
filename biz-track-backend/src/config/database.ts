import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 20000,
        keepAlive: true,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sadeepa@123',
        database: process.env.DB_NAME || 'biztrack_db',
        max: 20,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 20000,
        keepAlive: true,
      }
);

// Catch errors on idle clients in the pool to avoid crashing or zombie sockets
pool.on('error', (err) => {
  console.warn('⚠️ Idle PostgreSQL client error (connection dropped):', err.message);
});

/**
 * Execute query with automatic retry for transient socket/connection drops (common with serverless Neon pooler)
 */
export async function safeQuery<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R>> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await pool.query<R>(text, params);
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.code === 'ECONNRESET' ||
        err?.code === 'EPIPE' ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('socket') ||
        err?.message?.includes('timeout') ||
        err?.message?.includes('Connection terminated') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('Authentication timed out');

      if (attempt < maxRetries && isTransient) {
        console.warn(`⚠️ SafeQuery attempt ${attempt} failed with ${err.message}. Retrying in 500ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

const nextFridayDate = (): string => {
  const d = new Date();
  let add = (5 - d.getDay() + 7) % 7;
  if (!add) add = 7;
  d.setDate(d.getDate() + add);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

export async function initDatabase(): Promise<boolean> {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`⏳ Connecting to PostgreSQL database (attempt ${attempt}/${maxAttempts})...`);
      const client = await pool.connect();
      try {
        const dbIdentifier = connectionString ? 'Neon Cloud (neondb)' : (process.env.DB_NAME || 'biztrack_db');
        console.log('📦 Connected to PostgreSQL database:', dbIdentifier);

        // 0. Metadata table
        await client.query(`
          CREATE TABLE IF NOT EXISTS system_metadata (
            key VARCHAR(64) PRIMARY KEY,
            value TEXT NOT NULL
          );
        `);

        // 1. Settings table
        await client.query(`
          CREATE TABLE IF NOT EXISTS business_settings (
            id SERIAL PRIMARY KEY,
            business_name TEXT NOT NULL DEFAULT 'Biz Track',
            next_batch TEXT NOT NULL,
            currency VARCHAR(10) NOT NULL DEFAULT 'LKR'
          );
        `);

        // 2. Orders table
        await client.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(64) PRIMARY KEY,
            customer TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            date TEXT NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'pending',
            order_image TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Migration: Ensure order_image column exists on existing Neon tables
        await client.query(`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_image TEXT;
        `);

        // 3. Transactions table
        await client.query(`
          CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(64) PRIMARY KEY,
            type VARCHAR(20) NOT NULL,
            description TEXT NOT NULL,
            amount NUMERIC(14, 2) NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Seed settings if none exist
        const settingsCheck = await client.query('SELECT COUNT(*) FROM business_settings');
        if (parseInt(settingsCheck.rows[0].count, 10) === 0) {
          await client.query(
            `INSERT INTO business_settings (business_name, next_batch, currency) VALUES ($1, $2, $3)`,
            ['Biz Track', nextFridayDate(), 'LKR']
          );
          console.log('🌱 Seeded default business settings');
        }

        // Ensure system_metadata mark exists (0 sample data policy)
        await client.query(
          "INSERT INTO system_metadata (key, value) VALUES ('initial_seed_completed', 'true') ON CONFLICT (key) DO NOTHING"
        );
        console.log('✅ Neon Cloud database tables verified (0 sample data policy active).');

        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`❌ PostgreSQL connection attempt ${attempt}/${maxAttempts} failed:`, err);
      if (attempt < maxAttempts) {
        const delay = attempt * 1500;
        console.log(`Retrying connection in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return false;
      }
    }
  }
  return false;
}
