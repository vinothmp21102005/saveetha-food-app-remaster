const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');

const morgan = require('morgan');

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://saveetha-food-app-remaster.vercel.app", process.env.CLIENT_URL].filter(Boolean),
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inventory', require('./routes/inventory'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
