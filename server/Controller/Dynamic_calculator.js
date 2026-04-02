const { zomatoRiders } = require("../data/Riders");

const Dynamic_calculator = async (req, res) => {
  try {
    const { fleetId } = req.params;

    const rider = zomatoRiders[fleetId];

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    // Eligibility check
    if (rider.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Rider is not eligible because account status is ${rider.status}`,
      });
    }

    let base_price = 55;
    let final_price = base_price;

    // -----------------------------
    // 1. Location Multiplier
    // -----------------------------
    const locationMap = new Map([
      ["Delhi", 1.4],
      ["Mumbai", 1.3],
      ["Chennai", 1.3],
      ["Pune", 0.8],
      ["Hyderabad", 1.1],
      ["Bengaluru", 1.2],
    ]);

    const locationMultiplier = locationMap.get(rider.city) || 1.0;
    final_price *= locationMultiplier;

    // -----------------------------
    // 2. Season Multiplier
    // -----------------------------
    const monthMap = new Map([
      ["June", 1.3],
      ["July", 1.3],
      ["August", 1.3],
      ["September", 1.3],
      ["March", 1.15],
      ["April", 1.15],
      ["May", 1.15],
      ["January", 0.85],
      ["February", 0.85],
      ["December", 0.85],
    ]);

    const currentMonth = new Date().toLocaleString("en-IN", { month: "long" });
    const seasonMultiplier = monthMap.get(currentMonth) || 1.0;
    final_price *= seasonMultiplier;

    // -----------------------------
    // 3. Experience Multiplier
    // -----------------------------
    let experienceMultiplier = 1.0;
    if (rider.experience_months <= 3) experienceMultiplier = 1.25;
    else if (rider.experience_months <= 12) experienceMultiplier = 1.1;
    else if (rider.experience_months <= 24) experienceMultiplier = 1.0;
    else experienceMultiplier = 0.9;

    final_price *= experienceMultiplier;

    // -----------------------------
    // 4. Rating Multiplier
    // -----------------------------
    let ratingMultiplier = 1.0;
    if (rider.rating < 3.5) ratingMultiplier = 1.25;
    else if (rider.rating < 4.0) ratingMultiplier = 1.1;
    else if (rider.rating < 4.5) ratingMultiplier = 1.0;
    else ratingMultiplier = 0.9;

    final_price *= ratingMultiplier;

    // -----------------------------
    // 5. Activity Multiplier
    // -----------------------------
    let activityMultiplier = 1.0;
    if (rider.orders_last_30_days >= 180) activityMultiplier = 1.25;
    else if (rider.orders_last_30_days >= 120) activityMultiplier = 1.15;
    else if (rider.orders_last_30_days >= 60) activityMultiplier = 1.05;
    else if (rider.orders_last_30_days > 0) activityMultiplier = 0.95;
    else activityMultiplier = 1.4;

    final_price *= activityMultiplier;

    // -----------------------------
    // 6. Avg Hours Multiplier
    // -----------------------------
    let hoursMultiplier = 1.0;
    if (rider.avg_daily_hours >= 9) hoursMultiplier = 1.2;
    else if (rider.avg_daily_hours >= 7) hoursMultiplier = 1.1;
    else if (rider.avg_daily_hours >= 4) hoursMultiplier = 1.0;
    else if (rider.avg_daily_hours > 0) hoursMultiplier = 0.9;
    else hoursMultiplier = 1.2;

    final_price *= hoursMultiplier;

    // -----------------------------
    // 7. Earnings Multiplier
    // Higher earnings => higher insured income exposure
    // -----------------------------
    let earningsMultiplier = 1.0;
    if (rider.avg_earnings_per_day >= 800) earningsMultiplier = 1.2;
    else if (rider.avg_earnings_per_day >= 600) earningsMultiplier = 1.1;
    else if (rider.avg_earnings_per_day >= 400) earningsMultiplier = 1.0;
    else earningsMultiplier = 0.9;

    final_price *= earningsMultiplier;

    // -----------------------------
    // 8. Live Delivery Multiplier
    // -----------------------------
    const liveDeliveryMultiplier = rider.current_delivery ? 1.05 : 1.0;
    final_price *= liveDeliveryMultiplier;

    // -----------------------------
    // 9. Badge Multiplier
    // Reward strong rider history
    // -----------------------------
    let badgeMultiplier = 1.0;
    if (rider.badges?.includes("Top Performer") || rider.badges?.includes("Star Rider")) {
      badgeMultiplier = 0.95;
    }

    final_price *= badgeMultiplier;

    // -----------------------------
    // 10. Floor & Cap
    // -----------------------------
    const floorPrice = 35;
    const capPrice = 150;

    final_price = Math.max(floorPrice, Math.min(capPrice, final_price));
    final_price = Math.round(final_price);

    return res.status(200).json({
      success: true,
      message: "Dynamic premium calculated successfully",
      data: {
        fleet_id: rider.rider_id,
        rider_name: rider.full_name,
        city: rider.city,
        zone: rider.zone,
        account_status: rider.status,
        base_price,
        multipliers: {
          locationMultiplier,
          seasonMultiplier,
          experienceMultiplier,
          ratingMultiplier,
          activityMultiplier,
          hoursMultiplier,
          earningsMultiplier,
          liveDeliveryMultiplier,
          badgeMultiplier,
        },
        final_price,
      },
    });
  } catch (error) {
    console.error("Dynamic calculator error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = Dynamic_calculator;