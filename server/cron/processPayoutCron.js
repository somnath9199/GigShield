const cron = require("node-cron");
const supabase = require("../config/supabase");

console.log("Process payout cron initialized...");

cron.schedule("*/1 * * * *", async () => {
  console.log("Processing pending payouts:", new Date().toISOString());

  try {
    const { data: payouts, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("status", "pending");

    if (error) {
      console.error("Failed to fetch pending payouts:", error.message);
      return;
    }

    for (const payout of payouts || []) {
      const { error: updateError } = await supabase
        .from("payouts")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      if (updateError) {
        console.error(`Failed payout ${payout.id}:`, updateError.message);
      } else {
        console.log(`Payout sent: ₹${payout.amount} for payout ${payout.id}`);
      }
    }
  } catch (error) {
    console.error("Process payout cron error:", error.message);
  }
});