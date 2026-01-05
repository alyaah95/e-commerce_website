

const { Pool } = require('pg');


if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL is not defined in .env file.');
  process.exit(1); 
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database (Neon)!');
});

pool.on('error', (err) => {
  console.error('Error connecting to the PostgreSQL database:', err.message);
 
});

module.exports = pool;