const { createClient } = require('@supabase/supabase-js');
const { swiggyRiders, zomatoRiders, zeptoRiders } = require('./data/Riders');

const supabase = createClient(
  'https://dhshsndofflzamcqwmdx.supabase.co',
  'sb_publishable_X-ewY5Bh7pQiyStaPSWyWQ_xwzTiQKc'
);

async function seed() {
  const allRiders = [
    ...Object.values(swiggyRiders),
    ...Object.values(zomatoRiders),
    ...Object.values(zeptoRiders)
  ];

  const payload = allRiders.map(r => ({
    rider_id: r.rider_id,
    name: r.full_name,
    email: r.email,
    password: 'password123',
    phone: r.mobile,
    isactive: r.status === 'active',
    phone_number_verified: true
  }));

  console.log(`Attempting to upload ${payload.length} riders to Supabase...`);
  
  const { data, error } = await supabase.from('users').upsert(payload, { onConflict: 'rider_id' });
  
  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded", payload.length, "riders into Supabase!");
  }
}

seed();
