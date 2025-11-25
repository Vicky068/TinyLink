import pkg from "pg";
const { Pool } = pkg;

let pool;

function createPool() {
	if (pool) return pool;
	const config = {
		connectionString: process.env.DATABASE_URL,
		ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
	};
	pool = new Pool(config);
	return pool;
}

function getPool() {
	return pool || createPool();
}

async function ensureSchema() {
	try {
		const p = getPool();
		await p.query(`
			CREATE TABLE IF NOT EXISTS links (
				code VARCHAR PRIMARY KEY,
				url TEXT NOT NULL,
				clicks INT DEFAULT 0,
				last_clicked TIMESTAMP NULL,
				created_at TIMESTAMP DEFAULT NOW()
			)
		`);
		console.log('DB schema ensured');
	} catch (err) {
		// Log error but do not exit the process. Deployment environments (Render, Vercel)
		// should not be killed due to transient DB auth/network issues. Caller may retry.
		console.error('Schema init failed (continuing):', err);
	}
}

// Export a minimal pool-like object so existing imports that call `pool.query(...)`
// continue to work. Also export helpers for explicit control.
const db = {
	query: (...args) => getPool().query(...args),
};

export default db;
export { getPool, ensureSchema };