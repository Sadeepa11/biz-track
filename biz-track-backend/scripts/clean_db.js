const { pool } = require('../dist/config/database');

async function clean() {
  try {
    const delOrders = await pool.query("DELETE FROM orders WHERE id LIKE 'ord-882%'");
    console.log('Cleaned dummy orders from Neon DB:', delOrders.rowCount);

    const delTx = await pool.query("DELETE FROM transactions WHERE id LIKE 'tx-10%'");
    console.log('Cleaned dummy transactions from Neon DB:', delTx.rowCount);

    const o = await pool.query('SELECT * FROM orders');
    console.log('Current orders in Neon DB:', o.rows);

    const t = await pool.query('SELECT * FROM transactions');
    console.log('Current transactions in Neon DB:', t.rows);

    const s = await pool.query('SELECT * FROM business_settings');
    console.log('Settings in Neon DB:', s.rows);
  } catch (e) {
    console.error('Error cleaning DB:', e);
  } finally {
    await pool.end();
  }
}

clean();
