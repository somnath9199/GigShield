const express = require('express');
const router = require('./router/routes')
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/v1/api',router);

const port = process.env.PORT || 8000

app.get('/health-check', (req, res) => {
  res.json({ message: 'Healthy 🚀' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at ${port}`);
});