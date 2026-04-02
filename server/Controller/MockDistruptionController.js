const mockDisruptions = require("../data/mockDistruption");
const { zomatoRiders, swiggyRiders, zeptoRiders } = require("../data/Riders");

const getStatusFromTime = (event) => {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  if (now < start) return "scheduled";
  if (now >= start && now <= end) return "active";
  return "ended";
};

const findRiderById = (riderId) => {
  return (
    zomatoRiders[riderId] ||
    swiggyRiders[riderId] ||
    zeptoRiders[riderId] ||
    null
  );
};

const isSameText = (a, b) => {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
};

// Existing handlers if you want to keep them
const getAllDisruptions = async (req, res) => {
  try {
    const enriched = mockDisruptions.map((event) => ({
      ...event,
      current_status: getStatusFromTime(event),
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch disruptions",
      error: error.message,
    });
  }
};

const getActiveDisruptions = async (req, res) => {
  try {
    const active = mockDisruptions
      .map((event) => ({
        ...event,
        current_status: getStatusFromTime(event),
      }))
      .filter((event) => event.current_status === "active");

    return res.status(200).json({
      success: true,
      count: active.length,
      data: active,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active disruptions",
      error: error.message,
    });
  }
};

const getUpcomingDisruptions = async (req, res) => {
  try {
    const upcoming = mockDisruptions
      .map((event) => ({
        ...event,
        current_status: getStatusFromTime(event),
      }))
      .filter((event) => event.current_status === "scheduled");

    return res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming disruptions",
      error: error.message,
    });
  }
};

const getDisruptionsByLocation = async (req, res) => {
  try {
    const { state, city, zone } = req.query;

    let filtered = mockDisruptions.map((event) => ({
      ...event,
      current_status: getStatusFromTime(event),
    }));

    if (state) {
      filtered = filtered.filter((event) => isSameText(event.state, state));
    }

    if (city) {
      filtered = filtered.filter((event) => isSameText(event.city, city));
    }

    if (zone) {
      filtered = filtered.filter((event) => isSameText(event.zone, zone));
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch disruptions by location",
      error: error.message,
    });
  }
};

const getDisruptionById = async (req, res) => {
  try {
    const event = mockDisruptions.find((d) => d.id === req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Disruption not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...event,
        current_status: getStatusFromTime(event),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch disruption",
      error: error.message,
    });
  }
};

// NEW: GET /api/mock-disruptions/check/:riderId
const checkRiderDisruption = async (req, res) => {
  try {
    const { riderId } = req.params;

    const rider = findRiderById(riderId);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const activeDisruptions = mockDisruptions
      .map((event) => ({
        ...event,
        current_status: getStatusFromTime(event),
      }))
      .filter((event) => event.current_status === "active");

    const matchingDisruptions = activeDisruptions.filter((event) => {
      const sameCity = isSameText(event.city, rider.city);
      const sameZone = isSameText(event.zone, rider.zone);
      return sameCity && sameZone;
    });

    if (matchingDisruptions.length === 0) {
      return res.status(200).json({
        success: true,
        rider_id: rider.rider_id,
        rider_name: rider.full_name,
        city: rider.city,
        zone: rider.zone,
        account_status: rider.status,
        affected: false,
        eligible_for_payout: false,
        message: "No active disruption in rider zone",
        disruptions: [],
      });
    }

    const payoutEligibleDisruptions = matchingDisruptions.filter(
      (event) => event.payout_trigger === true
    );

    const eligibleForPayout =
      rider.status === "active" && payoutEligibleDisruptions.length > 0;

    return res.status(200).json({
      success: true,
      rider_id: rider.rider_id,
      rider_name: rider.full_name,
      city: rider.city,
      zone: rider.zone,
      account_status: rider.status,
      affected: true,
      eligible_for_payout: eligibleForPayout,
      message: eligibleForPayout
        ? "Rider is affected and eligible for payout"
        : "Rider is affected but not eligible for payout",
      disruptions: matchingDisruptions.map((event) => ({
        id: event.id,
        type: event.disruption_type,
        severity: event.severity,
        start_time: event.start_time,
        end_time: event.end_time,
        payout_trigger: event.payout_trigger,
        current_status: event.current_status,
        description: event.description,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check rider disruption",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDisruptions,
  getActiveDisruptions,
  getUpcomingDisruptions,
  getDisruptionsByLocation,
  getDisruptionById,
  checkRiderDisruption,
};