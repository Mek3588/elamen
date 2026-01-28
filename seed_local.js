const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_a4wb8qjGKQmO@ep-flat-fog-aheju0v8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function seed() {
  try {
    // Check if any products exist
    const res = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Current product count:', res.rows[0].count);
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding sample products...');
      await pool.query(`
        INSERT INTO products (name, price, category, available, description)
        VALUES 
          ('Tibs', 250, 'Mains', true, 'Sauteed beef with onions and peppers'),
          ('Doro Wat', 300, 'Mains', true, 'Spicy chicken stew with egg')
      `);
      console.log('Products seeded successfully');
    } else {
      console.log('Database already has products');
    }

    // Check if admin worker exists
    const workerRes = await pool.query("SELECT COUNT(*) FROM workers WHERE username = 'admin'");
    if (parseInt(workerRes.rows[0].count) === 0) {
      console.log('Seeding admin worker...');
      await pool.query(`
        INSERT INTO workers (username, password, role, active)
        VALUES ('admin', 'admin123', 'manager', true)
      `);
      console.log('Admin worker seeded successfully');
    } else {
      console.log('Admin worker already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
