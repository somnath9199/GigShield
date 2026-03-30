const { zomatoRiders } = require('../data/Riders');

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

const formatZomatoRider = (rider, detail = false) => {
  const base = {
    fleet_id: rider.rider_id, 
    account_status: rider.status,
    is_verified: rider.status === 'active',
    health_status: rider.account_health,
    service_city: rider.city,
    delivery_zone: rider.zone,
    platform: 'zomato',
  };

  if (detail) {
    Object.assign(base, {
      personal: {
        name: rider.full_name,
        contact: rider.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'),
        onboarding_date: rider.join_date,
        experience_months: rider.experience_months,
      },
      vehicle: {
        type: rider.vehicle_type,
        registration: rider.vehicle_number,
      },
      performance: {
        rating: rider.rating,
        lifetime_deliveries: rider.total_orders_lifetime,
        deliveries_last_30d: rider.orders_last_30_days,
        deliveries_last_7d: rider.orders_last_7_days,
        avg_hours_daily: rider.avg_daily_hours,
        avg_earnings_daily: rider.avg_earnings_per_day,
        achievement_badges: rider.badges,
      },
    });
  }

  return base;
};

// GET /zomato/v2/fleet/:fleetId/validate
const validateRider = async (req, res) => {
  await delay();
  const rider = zomatoRiders[req.params.fleetId];

  if (!rider) {
    return res.status(404).json({
      status: 'error',
      code: 'FLEET_MEMBER_NOT_FOUND',
      message: `Fleet member ${req.params.fleetId} does not exist`,
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      fleet_id: rider.rider_id,
      is_valid: true,
      account_status: rider.status,
      is_eligible_for_delivery: rider.status === 'active',
      service_city: rider.city,
      health_status: rider.account_health,
      ...(rider.suspension_reason && { suspension_reason: rider.suspension_reason }),
      ...(rider.warning_reason && { warning: rider.warning_reason }),
    },
  });
};

// GET /zomato/v2/fleet/:fleetId/profile
const getRiderProfile = async (req, res) => {
  await delay(200);
  const rider = zomatoRiders[req.params.fleetId];

  if (!rider) {
    return res.status(404).json({ status: 'error', code: 'FLEET_MEMBER_NOT_FOUND' });
  }

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: formatZomatoRider(rider, true),
  });
};

// GET /zomato/v2/fleet/:fleetId/delivery-history
const getDeliveryHistory = async (req, res) => {
  await delay(220);
  const rider = zomatoRiders[req.params.fleetId];

  if (!rider) {
    return res.status(404).json({ status: 'error', code: 'FLEET_MEMBER_NOT_FOUND' });
  }

  const { from, to, page = 1, per_page = 10 } = req.query;
  let history = rider.order_history;

  if (from) history = history.filter(o => o.date >= from);
  if (to) history = history.filter(o => o.date <= to);

  const start = (page - 1) * per_page;
  const paginated = history.slice(start, start + Number(per_page));

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      fleet_id: rider.rider_id,
      delivery_log: paginated.map(o => ({
        date: o.date,
        deliveries_completed: o.orders_completed,
        hours_on_duty: o.hours_worked,
        gross_earnings: o.earnings,
        service_zone: rider.zone,
        city: rider.city,
      })),
      meta: {
        page: Number(page),
        per_page: Number(per_page),
        total_records: history.length,
        total_pages: Math.ceil(history.length / per_page),
      },
      aggregate: {
        total_deliveries: history.reduce((s, o) => s + o.orders_completed, 0),
        total_earnings: history.reduce((s, o) => s + o.earnings, 0),
        total_hours: parseFloat(history.reduce((s, o) => s + o.hours_worked, 0).toFixed(1)),
        active_days: history.length,
      },
    },
  });
};

// GET /zomato/v2/fleet/:fleetId/performance
const getPerformance = async (req, res) => {
  await delay(130);
  const rider = zomatoRiders[req.params.fleetId];

  if (!rider) {
    return res.status(404).json({ status: 'error', code: 'FLEET_MEMBER_NOT_FOUND' });
  }

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      fleet_id: rider.rider_id,
      performance_summary: {
        rating: rider.rating,
        experience_months: rider.experience_months,
        lifetime_deliveries: rider.total_orders_lifetime,
        last_30_days: {
          deliveries: rider.orders_last_30_days,
          avg_daily_hours: rider.avg_daily_hours,
          avg_daily_earnings: rider.avg_earnings_per_day,
          estimated_total_earnings: rider.avg_earnings_per_day * 26,
        },
        last_7_days: {
          deliveries: rider.orders_last_7_days,
        },
        badges: rider.badges,
        tier: rider.total_orders_lifetime > 5000
          ? 'platinum'
          : rider.total_orders_lifetime > 1000
          ? 'gold'
          : rider.total_orders_lifetime > 300
          ? 'silver'
          : 'bronze',
      },
    },
  });
};

// GET /zomato/v2/fleet/:fleetId/live
const getLiveStatus = async (req, res) => {
  await delay(90);
  const rider = zomatoRiders[req.params.fleetId];

  if (!rider) {
    return res.status(404).json({ status: 'error', code: 'FLEET_MEMBER_NOT_FOUND' });
  }

  const isOnline = rider.status === 'active' && Math.random() > 0.25;

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      fleet_id: rider.rider_id,
      online: isOnline,
      on_delivery: !!rider.current_delivery,
      active_order: rider.current_delivery,
      gps: isOnline
        ? {
            lat: rider.current_lat + (Math.random() - 0.5) * 0.008,
            lng: rider.current_lng + (Math.random() - 0.5) * 0.008,
            accuracy_meters: Math.floor(Math.random() * 10) + 3,
          }
        : null,
      last_ping: isOnline
        ? new Date(Date.now() - Math.random() * 3 * 60 * 1000).toISOString()
        : new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
    },
  });
};

module.exports = { validateRider, getRiderProfile, getDeliveryHistory, getPerformance, getLiveStatus };