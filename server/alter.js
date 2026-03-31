const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Guidewire@4567@db.dhshsndofflzamcqwmdx.supabase.co:5432/postgres'
});

async function upgradeDB() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const addCols = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS coverage_status varchar DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS total_received numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS this_week_premium numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS weekly_payouts jsonb DEFAULT '[0,0,0,0,0,0,0]'::jsonb,
      ADD COLUMN IF NOT EXISTS weekly_premiums jsonb DEFAULT '[0,0,0,0,0,0,0]'::jsonb;
    `;
    await client.query(addCols);
    console.log("Added dashboard columns to users table.");

    const res = await client.query('SELECT phone FROM users');
    for (let row of res.rows) {
      const isRandomPayout = Math.random() > 0.5;
      const totalRec = isRandomPayout ? Math.floor(Math.random() * 3000 + 500) : 0;
      const weekPrem = Math.floor(Math.random() * 150 + 50);
      
      const payoutArr = [0, 0, isRandomPayout ? Math.floor(Math.random() * 400 + 100) : 0, 0, 0, 0, 0];
      const premiumArr = [40, 40, 50, 40, 45, 50, weekPrem];

      await client.query(
        `UPDATE users 
         SET coverage_status = 'Active', 
             total_received = $1, 
             this_week_premium = $2, 
             weekly_payouts = $3::jsonb, 
             weekly_premiums = $4::jsonb 
         WHERE phone = $5`,
        [totalRec, weekPrem, JSON.stringify(payoutArr), JSON.stringify(premiumArr), row.phone]
      );
    }
    console.log("Seeded user telemetry data!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

upgradeDB();
