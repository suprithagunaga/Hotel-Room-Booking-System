import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
pg.types.setTypeParser(1082, (value) => value);
export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	connectionTimeoutMillis: 3000,
	query_timeout: 5000,
});
