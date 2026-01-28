const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_a4wb8qjGKQmO@ep-flat-fog-aheju0v8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

pool.query('SELECT 1 as test', (err, res) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } else {
    console.log('Connection successful:', res.rows[0]);
    pool.end();
    process.exit(0);
  }
});