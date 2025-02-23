import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30 seconds
});

/**
 * Executes a query using the pooled connection.
 * @param text SQL query string
 * @param params Optional array of parameters
 * @returns The query result from the database.
 */
export async function query(text: string, params?: any[]): Promise<QueryResult<any>> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release(); // return the client to the pool
  }
}
