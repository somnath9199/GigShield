// Mock rider database — simulates Swiggy/Zomato internal rider records
// In production this would be their actual database

const { v4: uuidv4 } = require('uuid');

// Helper to generate order history for last N days
const generateOrderHistory = (avgPerDay, days = 30) => {
  const history = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();

    // Riders work less on Sunday (0) 
    const isRestDay = dayOfWeek === 0 && Math.random() > 0.4;
    if (isRestDay) continue;

    // Randomize orders per day around average
    const ordersToday = Math.max(0, Math.round(avgPerDay + (Math.random() - 0.5) * 6));
    const hoursWorked = ordersToday > 0 ? (ordersToday / avgPerDay) * 7 + Math.random() * 2 : 0;

    if (ordersToday > 0) {
      history.push({
        date: date.toISOString().split('T')[0],
        orders_completed: ordersToday,
        hours_worked: parseFloat(hoursWorked.toFixed(1)),
        earnings: ordersToday * (45 + Math.floor(Math.random() * 25)), // ₹45–70 per order
        city: null, // filled per rider
        zone: null,
      });
    }
  }
  return history;
};

// Generate current active delivery (50% chance)
const generateActiveDelivery = (city, zone) => {
  if (Math.random() > 0.5) return null;
  return {
    order_id: `ORD_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: ['picked_up', 'heading_to_customer', 'nearby'][Math.floor(Math.random() * 3)],
    restaurant: ['McDonald\'s', 'Domino\'s', 'Burger King', 'Haldiram\'s', 'Subway'][Math.floor(Math.random() * 5)],
    pickup_zone: zone,
    estimated_delivery_minutes: Math.floor(Math.random() * 20) + 5,
    started_at: new Date(Date.now() - Math.random() * 20 * 60 * 1000).toISOString(),
  };
};

// ============================================================
// SWIGGY MOCK RIDERS
// ============================================================
const swiggyRiders = {
  'SW001': {
    rider_id: 'SW001',
    full_name: 'Ravi Kumar',
    mobile: '9876543210',
    email: 'ravi.kumar@gmail.com',
    status: 'active',         // active | inactive | suspended | on_leave
    join_date: '2022-08-15',
    city: 'Delhi',
    zone: 'Connaught Place',
    current_lat: 28.6329,
    current_lng: 77.2195,
    vehicle_type: 'bike',
    vehicle_number: 'DL01AB1234',
    rating: 4.7,
    total_orders_lifetime: 2847,
    orders_last_30_days: 156,
    orders_last_7_days: 38,
    avg_daily_hours: 8.2,
    avg_earnings_per_day: 820,
    experience_months: 20,
    current_delivery: generateActiveDelivery('Delhi', 'Connaught Place'),
    order_history: generateOrderHistory(6, 30).map(o => ({ ...o, city: 'Delhi', zone: 'Connaught Place' })),
    badges: ['Top Performer', '1000+ Deliveries', 'On Time Champion'],
    account_health: 'good',
  },

  'SW002': {
    rider_id: 'SW002',
    full_name: 'Priya Singh',
    mobile: '9123456780',
    email: 'priya.singh@gmail.com',
    status: 'active',
    join_date: '2024-01-10',
    city: 'Mumbai',
    zone: 'Andheri West',
    current_lat: 19.1297,
    current_lng: 72.8272,
    vehicle_type: 'bicycle',
    vehicle_number: null,
    rating: 4.4,
    total_orders_lifetime: 312,
    orders_last_30_days: 72,
    orders_last_7_days: 18,
    avg_daily_hours: 4.5,
    avg_earnings_per_day: 410,
    experience_months: 3,
    current_delivery: null,
    order_history: generateOrderHistory(3, 30).map(o => ({ ...o, city: 'Mumbai', zone: 'Andheri West' })),
    badges: ['New Rider'],
    account_health: 'good',
  },

  'SW003': {
    rider_id: 'SW003',
    full_name: 'Arjun Patel',
    mobile: '9988776655',
    email: 'arjun.p@yahoo.com',
    status: 'on_leave',
    join_date: '2021-03-22',
    city: 'Bengaluru',
    zone: 'Koramangala',
    current_lat: 12.9352,
    current_lng: 77.6245,
    vehicle_type: 'bike',
    vehicle_number: 'KA03CD5678',
    rating: 4.9,
    total_orders_lifetime: 5621,
    orders_last_30_days: 0,    // on leave
    orders_last_7_days: 0,
    avg_daily_hours: 0,
    avg_earnings_per_day: 0,
    experience_months: 49,
    current_delivery: null,
    order_history: [],
    badges: ['Top Performer', '5000+ Deliveries', 'Star Rider', 'On Time Champion'],
    account_health: 'good',
  },

  'SW004': {
    rider_id: 'SW004',
    full_name: 'Mohammed Faiz',
    mobile: '9765432109',
    email: 'faiz.m@gmail.com',
    status: 'suspended',
    join_date: '2023-06-01',
    city: 'Chennai',
    zone: 'T. Nagar',
    current_lat: 13.0418,
    current_lng: 80.2341,
    vehicle_type: 'bike',
    vehicle_number: 'TN09EF9012',
    rating: 3.1,
    total_orders_lifetime: 891,
    orders_last_30_days: 0,   // suspended
    orders_last_7_days: 0,
    avg_daily_hours: 0,
    avg_earnings_per_day: 0,
    experience_months: 10,
    current_delivery: null,
    order_history: [],
    badges: [],
    account_health: 'suspended',
    suspension_reason: 'Multiple customer complaints',
  },

  'SW005': {
    rider_id: 'SW005',
    full_name: 'Deepika Rao',
    mobile: '9654321098',
    email: 'deepika.rao@gmail.com',
    status: 'active',
    join_date: '2023-11-05',
    city: 'Hyderabad',
    zone: 'Banjara Hills',
    current_lat: 17.4138,
    current_lng: 78.4482,
    vehicle_type: 'scooter',
    vehicle_number: 'TS07GH3456',
    rating: 4.6,
    total_orders_lifetime: 634,
    orders_last_30_days: 98,
    orders_last_7_days: 24,
    avg_daily_hours: 6.1,
    avg_earnings_per_day: 560,
    experience_months: 5,
    current_delivery: generateActiveDelivery('Hyderabad', 'Banjara Hills'),
    order_history: generateOrderHistory(4, 30).map(o => ({ ...o, city: 'Hyderabad', zone: 'Banjara Hills' })),
    badges: ['Fast Responder'],
    account_health: 'good',
  },
};

// ============================================================
// ZOMATO MOCK RIDERS
// ============================================================
const zomatoRiders = {
  'ZM001': {
    rider_id: 'ZM001',
    full_name: 'Suresh Nair',
    mobile: '9543210987',
    email: 'suresh.nair@gmail.com',
    status: 'active',
    join_date: '2022-01-18',
    city: 'Mumbai',
    zone: 'Bandra',
    current_lat: 19.0596,
    current_lng: 72.8295,
    vehicle_type: 'bike',
    vehicle_number: 'MH02IJ7890',
    rating: 4.8,
    total_orders_lifetime: 3102,
    orders_last_30_days: 134,
    orders_last_7_days: 31,
    avg_daily_hours: 7.8,
    avg_earnings_per_day: 750,
    experience_months: 27,
    current_delivery: generateActiveDelivery('Mumbai', 'Bandra'),
    order_history: generateOrderHistory(5, 30).map(o => ({ ...o, city: 'Mumbai', zone: 'Bandra' })),
    badges: ['Top Performer', '3000+ Deliveries'],
    account_health: 'good',
  },

  'ZM002': {
    rider_id: 'ZM002',
    full_name: 'Ankita Sharma',
    mobile: '9432109876',
    email: 'ankita.s@gmail.com',
    status: 'active',
    join_date: '2024-02-20',
    city: 'Delhi',
    zone: 'Lajpat Nagar',
    current_lat: 28.5706,
    current_lng: 77.2401,
    vehicle_type: 'scooter',
    vehicle_number: 'DL08KL2345',
    rating: 4.3,
    total_orders_lifetime: 187,
    orders_last_30_days: 61,
    orders_last_7_days: 15,
    avg_daily_hours: 3.8,
    avg_earnings_per_day: 340,
    experience_months: 1,
    current_delivery: null,
    order_history: generateOrderHistory(2.5, 30).map(o => ({ ...o, city: 'Delhi', zone: 'Lajpat Nagar' })),
    badges: ['New Rider'],
    account_health: 'good',
  },

  'ZM003': {
    rider_id: 'ZM003',
    full_name: 'Vikram Mehta',
    mobile: '9321098765',
    email: 'vikram.m@gmail.com',
    status: 'active',
    join_date: '2020-09-10',
    city: 'Pune',
    zone: 'Kothrud',
    current_lat: 18.5018,
    current_lng: 73.8163,
    vehicle_type: 'bike',
    vehicle_number: 'MH12MN6789',
    rating: 4.95,
    total_orders_lifetime: 7834,
    orders_last_30_days: 178,
    orders_last_7_days: 43,
    avg_daily_hours: 9.1,
    avg_earnings_per_day: 910,
    experience_months: 55,
    current_delivery: generateActiveDelivery('Pune', 'Kothrud'),
    order_history: generateOrderHistory(7, 30).map(o => ({ ...o, city: 'Pune', zone: 'Kothrud' })),
    badges: ['Top Performer', '7500+ Deliveries', 'Star Rider', 'On Time Champion', 'Fleet Leader'],
    account_health: 'good',
  },

  'ZM004': {
    rider_id: 'ZM004',
    full_name: 'Rekha Pillai',
    mobile: '9210987654',
    email: 'rekha.p@gmail.com',
    status: 'inactive',
    join_date: '2023-03-14',
    city: 'Chennai',
    zone: 'Anna Nagar',
    current_lat: 13.085,
    current_lng: 80.2101,
    vehicle_type: 'bicycle',
    vehicle_number: null,
    rating: 4.1,
    total_orders_lifetime: 445,
    orders_last_30_days: 12,   // barely active
    orders_last_7_days: 2,
    avg_daily_hours: 1.2,
    avg_earnings_per_day: 95,
    experience_months: 13,
    current_delivery: null,
    order_history: generateOrderHistory(0.5, 30).map(o => ({ ...o, city: 'Chennai', zone: 'Anna Nagar' })),
    badges: [],
    account_health: 'warning',
    warning_reason: 'Low activity for 3 weeks',
  },
};

// ============================================================
// ZEPTO MOCK RIDERS
// ============================================================
const zeptoRiders = {
  'ZP001': {
    rider_id: 'ZP001',
    full_name: 'Rahul Gupta',
    mobile: '9109876543',
    email: 'rahul.g@gmail.com',
    status: 'active',
    join_date: '2023-07-22',
    city: 'Mumbai',
    zone: 'Powai',
    current_lat: 19.1176,
    current_lng: 72.9061,
    vehicle_type: 'bike',
    vehicle_number: 'MH04PQ1234',
    rating: 4.6,
    total_orders_lifetime: 1892,
    orders_last_30_days: 210,   // Zepto = more deliveries (10min delivery model)
    orders_last_7_days: 52,
    avg_daily_hours: 8.5,
    avg_earnings_per_day: 680,
    experience_months: 9,
    current_delivery: generateActiveDelivery('Mumbai', 'Powai'),
    order_history: generateOrderHistory(8, 30).map(o => ({ ...o, city: 'Mumbai', zone: 'Powai' })),
    badges: ['Speed Demon', '1500+ Deliveries'],
    account_health: 'good',
  },
};

module.exports = { swiggyRiders, zomatoRiders, zeptoRiders };