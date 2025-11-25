import pkg from "pg";
const { Pool } = pkg;

// Create pool with SSL enabled for NeonDB (Neon requires SSL)
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

// Initialize DB schema if missing
const initDb = async () => {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS links (
			code VARCHAR PRIMARY KEY,
			url TEXT NOT NULL,
			clicks INT DEFAULT 0,
			last_clicked TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT NOW()
		)
	`);
};

initDb().catch((err) => {
	console.error("Failed to initialize database schema:", err);
	process.exit(1);
});

export default pool;
export { pool };