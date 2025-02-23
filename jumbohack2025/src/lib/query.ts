import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30 seconds
});

/**
 * Execute a SQL query using the connection pool.
 * @param query - The SQL query string.
 * @param params - The query parameters (optional).
 * @returns The result of the query.
 */
export async function query(query: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}