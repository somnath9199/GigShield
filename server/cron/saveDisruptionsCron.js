const cron = require("node-cron");
const axios = require("axios");
const supabase = require("../config/supabase");

console.log("🚀 Disruption cron initialized...");

cron.schedule("* * * * *", async () => {
  console.log("\n🕒 CRON START:", new Date().toLocaleString());

  try {
    const response = await axios.get(
      "http://localhost:8000/api/mock-disruptions"
    );

    const disruptions = response.data.data || [];

    console.log(`📡 Fetched ${disruptions.length} disruptions`);

    for (const d of disruptions) {
      console.log(`\n🔍 Checking disruption: ${d.id}`);

      const { data: existing, error: fetchError } = await supabase
        .from("disruptions")
        .select("*")
        .eq("external_id", d.id)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ DB fetch error:", fetchError.message);
        continue;
      }

      if (!existing) {
        console.log(`➕ Inserting new disruption: ${d.id}`);

        const { error: insertError } = await supabase
          .from("disruptions")
          .insert([
            {
              external_id: d.id,
              state: d.state,
              city: d.city,
              zone: d.zone,
              disruption_type: d.disruption_type,
              severity: d.severity,
              start_time: d.start_time,
              end_time: d.end_time,
              payout_trigger: d.payout_trigger,
              status: d.current_status
            }
          ]);

        if (insertError) {
          console.error(`❌ Insert failed for ${d.id}:`, insertError.message);
        } else {
          console.log(`✅ Inserted successfully: ${d.id}`);
        }
      } else {
        console.log(`♻️ Updating existing disruption: ${d.id}`);

        const { error: updateError } = await supabase
          .from("disruptions")
          .update({
            status: d.current_status
          })
          .eq("external_id", d.id);

        if (updateError) {
          console.error(`❌ Update failed for ${d.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated status: ${d.id} → ${d.current_status}`);
        }
      }
    }

    console.log("✅ CRON END SUCCESS");
  } catch (error) {
    console.error("🔥 CRON ERROR:", error.message);
  }
});