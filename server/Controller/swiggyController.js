const { swiggyRiders } = require('../data/Riders');

// Simulate API latency like a real external service
const delay = (ms = 120) => new Promise(r => setTimeout(r, ms));

// Format rider for API response — only expose what partners need
const formatRider = (rider, fields = 'basic') => {
  const base = {
    rider_id: rider.rider_id,
    status: rider.status,
    account_health: rider.account_health,
    city: rider.city,
    zone: rider.zone,
    platform: 'swiggy',
    verified: rider.status === 'active',
  };

  if (fields === 'full' || fields === 'stats') {
    Object.assign(base, {
      full_name: rider.full_name,
      join_date: rider.join_date,
      vehicle_type: rider.vehicle_type,
      rating: rider.rating,
      experience_months: rider.experience_months,
      stats: {
        total_orders_lifetime: rider.total_orders_lifetime,
        orders_last_30_days: rider.orders_last_30_days,
        orders_last_7_days: rider.orders_last_7_days,
        avg_daily_hours: rider.avg_daily_hours,
        avg_earnings_per_day: rider.avg_earnings_per_day,
      },
      badges: rider.badges,
    });
  }

  if (fields === 'full') {
    Object.assign(base, {
      mobile: rider.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2'), // masked
      current_location: {
        lat: rider.current_lat,
        lng: rider.current_lng,
        zone: rider.zone,
        city: rider.city,
      },
      current_delivery: rider.current_delivery,
    });
  }

  return base;
};

// GET /swiggy/v1/riders/:riderId/verify
// Simple ID check — is this a real Swiggy rider?
const verifyRider = async (req, res) => {
  await delay();
  const rider = swiggyRiders[req.params.riderId];

  if (!rider) {
    return res.status(404).json({
      success: false,
      error: 'RIDER_NOT_FOUND',
      message: `No rider found with ID ${req.params.riderId}`,
      request_id: `req_${Date.now()}`,
    });
  }

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: {
      rider_id: rider.rider_id,
      is_valid: true,
      status: rider.status,
      is_active: rider.status === 'active',
      account_health: rider.account_health,
      city: rider.city,
      platform: 'swiggy',
      verified_at: new Date().toISOString(),
    },
  });
};

// GET /swiggy/v1/riders/:riderId/profile
// Full profile with stats
const getRiderProfile = async (req, res) => {
  await delay(180);
  const rider = swiggyRiders[req.params.riderId];

  if (!rider) {
    return res.status(404).json({
      success: false,
      error: 'RIDER_NOT_FOUND',
      message: `No rider found with ID ${req.params.riderId}`,
    });
  }

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: formatRider(rider, 'full'),
  });
};

// GET /swiggy/v1/riders/:riderId/orders
// Paginated order history
const getOrderHistory = async (req, res) => {
  await delay(200);
  const rider = swiggyRiders[req.params.riderId];

  if (!rider) {
    return res.status(404).json({ success: false, error: 'RIDER_NOT_FOUND' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const fromDate = req.query.from_date;
  const toDate = req.query.to_date;

  let history = rider.order_history;

  // Filter by date range if provided
  if (fromDate) history = history.filter(o => o.date >= fromDate);
  if (toDate) history = history.filter(o => o.date <= toDate);

  const total = history.length;
  const paginated = history.slice((page - 1) * limit, page * limit);

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: {
      rider_id: rider.rider_id,
      orders: paginated,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
      },
      summary: {
        total_days_with_orders: history.length,
        total_orders: history.reduce((s, o) => s + o.orders_completed, 0),
        total_earnings: history.reduce((s, o) => s + o.earnings, 0),
        avg_orders_per_day: parseFloat((history.reduce((s, o) => s + o.orders_completed, 0) / Math.max(history.length, 1)).toFixed(1)),
        avg_hours_per_day: parseFloat((history.reduce((s, o) => s + o.hours_worked, 0) / Math.max(history.length, 1)).toFixed(1)),
      },
    },
  });
};

// GET /swiggy/v1/riders/:riderId/stats
// Summary stats only (lightweight)
const getRiderStats = async (req, res) => {
  await delay(100);
  const rider = swiggyRiders[req.params.riderId];

  if (!rider) {
    return res.status(404).json({ success: false, error: 'RIDER_NOT_FOUND' });
  }

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: {
      rider_id: rider.rider_id,
      status: rider.status,
      stats: {
        total_orders_lifetime: rider.total_orders_lifetime,
        orders_last_30_days: rider.orders_last_30_days,
        orders_last_7_days: rider.orders_last_7_days,
        avg_daily_hours: rider.avg_daily_hours,
        avg_earnings_per_day: rider.avg_earnings_per_day,
        experience_months: rider.experience_months,
        rating: rider.rating,
        badges: rider.badges,
      },
      as_of: new Date().toISOString(),
    },
  });
};

// GET /swiggy/v1/riders/:riderId/current
// Real-time: is rider online right now?
const getCurrentStatus = async (req, res) => {
  await delay(80);
  const rider = swiggyRiders[req.params.riderId];

  if (!rider) {
    return res.status(404).json({ success: false, error: 'RIDER_NOT_FOUND' });
  }

  const isOnline = rider.status === 'active' && Math.random() > 0.3;

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: {
      rider_id: rider.rider_id,
      is_online: isOnline,
      is_on_delivery: !!rider.current_delivery,
      current_delivery: rider.current_delivery,
      last_seen: isOnline
        ? new Date(Date.now() - Math.random() * 5 * 60 * 1000).toISOString()
        : new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString(),
      current_location: isOnline
        ? { lat: rider.current_lat + (Math.random() - 0.5) * 0.01, lng: rider.current_lng + (Math.random() - 0.5) * 0.01 }
        : null,
      checked_at: new Date().toISOString(),
    },
  });
};

// POST /swiggy/v1/riders/bulk-verify
// Verify multiple rider IDs at once
const bulkVerify = async (req, res) => {
  await delay(300);
  const { rider_ids } = req.body;

  if (!Array.isArray(rider_ids) || rider_ids.length === 0) {
    return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: 'rider_ids array required' });
  }

  if (rider_ids.length > 50) {
    return res.status(400).json({ success: false, error: 'LIMIT_EXCEEDED', message: 'Max 50 IDs per request' });
  }

  const results = rider_ids.map(id => {
    const rider = swiggyRiders[id];
    return {
      rider_id: id,
      is_valid: !!rider,
      status: rider?.status || null,
      is_active: rider?.status === 'active' || false,
      city: rider?.city || null,
    };
  });

  return res.json({
    success: true,
    request_id: `req_${Date.now()}`,
    data: {
      results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.is_valid).length,
        active: results.filter(r => r.is_active).length,
        invalid: results.filter(r => !r.is_valid).length,
      },
    },
  });
};

module.exports = { verifyRider, getRiderProfile, getOrderHistory, getRiderStats, getCurrentStatus, bulkVerify };