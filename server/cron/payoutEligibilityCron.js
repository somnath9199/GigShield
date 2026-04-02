const cron = require("node-cron");
const supabase = require("../config/supabase");
const { zomatoRiders, swiggyRiders, zeptoRiders } = require("../data/Riders");

const findRiderById = (riderId) => {
  return (
    zomatoRiders[riderId] ||
    swiggyRiders[riderId] ||
    zeptoRiders[riderId] ||
    null
  );
};

console.log("Payout eligibility cron initialized...");

cron.schedule("*/1 * * * *", async () => {
  console.log("Checking payout eligibility:", new Date().toISOString());

  try {
    const { data: disruptions, error: disruptionsError } = await supabase
      .from("disruptions")
      .select("*")
      .eq("status", "active")
      .eq("payout_trigger", true);

    if (disruptionsError) {
      console.error("Failed to fetch disruptions:", disruptionsError.message);
      return;
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("coverage_status", "Active")
      .eq("payout_setup_done", true);

    if (usersError) {
      console.error("Failed to fetch users:", usersError.message);
      return;
    }

    for (const disruption of disruptions || []) {
      for (const user of users || []) {
        const rider = findRiderById(user.rider_id);
        if (!rider) continue;

        const sameCity =
          String(rider.city || "").toLowerCase() ===
          String(disruption.city || "").toLowerCase();

        const sameZone =
          String(rider.zone || "").toLowerCase() ===
          String(disruption.zone || "").toLowerCase();

        if (!sameCity || !sameZone) continue;

        const { data: existingPayout, error: existingError } = await supabase
          .from("payouts")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("disruption_id", disruption.id)
          .maybeSingle();

        if (existingError) {
          console.error("Existing payout check failed:", existingError.message);
          continue;
        }

        if (existingPayout) {
          console.log(
            `Skipping duplicate payout for user ${user.id} and disruption ${disruption.id}`
          );
          continue;
        }

        const { error: insertError } = await supabase.from("payouts").insert([
          {
            user_id: user.id,
            rider_id: user.rider_id,
            disruption_id: disruption.id,
            amount: 200,
            status: "pending",
            bank_account_number: user.bank_account_number,
            bank_ifsc: user.bank_ifsc,
          },
        ]);

        if (insertError) {
          console.error("Failed to create payout:", insertError.message);
        } else {
          console.log(
            `Created payout of ₹200 for user ${user.id} on disruption ${disruption.id}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Eligibility cron error:", error.message);
  }
});