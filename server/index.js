const express = require('express');
const router = require('./router/routes')
const cors = require('cors')
require('dotenv').config();
require("./cron/saveDisruptionsCron");
require("./cron/payoutEligibilityCron")
require("./cron/processPayoutCron")
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api',router);

const port = process.env.PORT || 8000

app.get('/health-check', (req, res) => {
  res.json({ message: 'Healthy 🚀' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at ${port}`);
});