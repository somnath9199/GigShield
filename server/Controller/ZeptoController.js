const { zeptoRiders } = require('../data/Riders');

const delay = (ms = 100) => new Promise(r => setTimeout(r, ms));

// GET /zepto/v1/delivery-partners/:partnerId/check
const checkPartner = async (req, res) => {
  await delay();
  const rider = zeptoRiders[req.params.partnerId];

  if (!rider) {
    return res.status(404).json({
      ok: false,
      error_code: 'PARTNER_NOT_FOUND',
      error_message: `Delivery partner ${req.params.partnerId} not registered`,
    });
  }

  return res.json({
    ok: true,
    data: {
      partner_id: rider.rider_id,
      active: rider.status === 'active',
      city: rider.city,
      hub_zone: rider.zone,
      platform: 'zepto',
      onboarded_at: rider.join_date,
    },
  });
};

// GET /zepto/v1/delivery-partners/:partnerId/summary
const getPartnerSummary = async (req, res) => {
  await delay(160);
  const rider = zeptoRiders[req.params.partnerId];

  if (!rider) {
    return res.status(404).json({ ok: false, error_code: 'PARTNER_NOT_FOUND' });
  }

  return res.json({
    ok: true,
    data: {
      partner_id: rider.rider_id,
      name: rider.full_name,
      status: rider.status,
      rating: rider.rating,
      city: rider.city,
      hub: rider.zone,
      vehicle: rider.vehicle_type,
      stats: {
        // Zepto has more deliveries per day (10-min model)
        lifetime_runs: rider.total_orders_lifetime,
        runs_last_30d: rider.orders_last_30_days,
        runs_last_7d: rider.orders_last_7_days,
        avg_daily_runs: Math.round(rider.orders_last_30_days / 26),
        avg_shift_hours: rider.avg_daily_hours,
        avg_daily_pay: rider.avg_earnings_per_day,
      },
      experience_months: rider.experience_months,
      badges: rider.badges,
    },
  });
};

// GET /zepto/v1/delivery-partners/:partnerId/run-history
const getRunHistory = async (req, res) => {
  await delay(190);
  const rider = zeptoRiders[req.params.partnerId];

  if (!rider) {
    return res.status(404).json({ ok: false, error_code: 'PARTNER_NOT_FOUND' });
  }

  const { days = 30 } = req.query;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days));
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const history = rider.order_history.filter(o => o.date >= cutoffStr);

  return res.json({
    ok: true,
    data: {
      partner_id: rider.rider_id,
      period_days: Number(days),
      run_log: history.map(o => ({
        date: o.date,
        completed_runs: o.orders_completed,
        shift_hours: o.hours_worked,
        pay: o.earnings,
        hub: rider.zone,
      })),
      totals: {
        runs: history.reduce((s, o) => s + o.orders_completed, 0),
        pay: history.reduce((s, o) => s + o.earnings, 0),
        active_days: history.length,
      },
    },
  });
};

// GET /zepto/v1/delivery-partners/:partnerId/live-location
const getLiveLocation = async (req, res) => {
  await delay(70);
  const rider = zeptoRiders[req.params.partnerId];

  if (!rider) {
    return res.status(404).json({ ok: false, error_code: 'PARTNER_NOT_FOUND' });
  }

  const tracking = rider.status === 'active' && Math.random() > 0.2;

  return res.json({
    ok: true,
    data: {
      partner_id: rider.rider_id,
      tracking_available: tracking,
      location: tracking
        ? {
            lat: rider.current_lat + (Math.random() - 0.5) * 0.005,
            lng: rider.current_lng + (Math.random() - 0.5) * 0.005,
            hub_distance_km: parseFloat((Math.random() * 3).toFixed(1)),
          }
        : null,
      on_run: !!rider.current_delivery,
      current_run: rider.current_delivery,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = { checkPartner, getPartnerSummary, getRunHistory, getLiveLocation };