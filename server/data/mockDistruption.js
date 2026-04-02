const mockDisruptions = [
  {
    id: "DST001",
    state: "Maharashtra",
    city: "Mumbai",
    zone: "Bandra",
    disruption_type: "heavy_rain",
    severity: "high",
    status: "scheduled",
    start_time: "2026-04-02T12:00:00+05:30",
    end_time: "2026-04-02T21:00:00+05:30",
    payout_trigger: true,
    description: "Heavy rainfall likely to impact deliveries in Powai.",
    coordinates: {
      lat: 19.1176,
      lng: 72.9060
    }
  },
  {
    id: "DST008",
    state: "Maharashtra",
    city: "Mumbai",
    zone: "Bandra",
    disruption_type: "heavy_Storm",
    severity: "high",
    status: "scheduled",
    start_time: "2026-04-02T16:00:00+05:30",
    end_time: "2026-04-02T21:00:00+05:30",
    payout_trigger: true,
    description: "Heavy rainfall likely to impact deliveries in Powai.",
    coordinates: {
      lat: 19.1176,
      lng: 72.9060
    }
  },
  {
    id: "DST002",
    state: "Tamil Nadu",
    city: "Chennai",
    zone: "T. Nagar",
    disruption_type: "heatwave",
    severity: "extreme",
    status: "scheduled",
    start_time: "2026-04-03T12:00:00+05:30",
    end_time: "2026-04-03T16:00:00+05:30",
    payout_trigger: true,
    description: "Extreme heat above threshold expected in T. Nagar.",
    coordinates: {
      lat: 13.0418,
      lng: 80.2341
    }
  },
  {
    id: "DST003",
    state: "Delhi",
    city: "Delhi",
    zone: "Connaught Place",
    disruption_type: "road_block",
    severity: "medium",
    status: "scheduled",
    start_time: "2026-04-02T17:30:00+05:30",
    end_time: "2026-04-02T19:30:00+05:30",
    payout_trigger: false,
    description: "Traffic blockade due to civic work.",
    coordinates: {
      lat: 28.6329,
      lng: 77.2195
    }
  },
  {
    id: "DST004",
    state: "Maharashtra",
    city: "Pune",
    zone: "Kothrud",
    disruption_type: "flood",
    severity: "high",
    status: "scheduled",
    start_time: "2026-04-04T08:00:00+05:30",
    end_time: "2026-04-04T14:00:00+05:30",
    payout_trigger: true,
    description: "Localized flooding expected in low-lying roads.",
    coordinates: {
      lat: 18.5018,
      lng: 73.8163
    }
  }
];

module.exports = mockDisruptions;