

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');
const setupRoutes = require('./routes/setupRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const orderRoutes = require('./routes/orderRoutes');

const app = express();
// const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: '*', // مؤقتاً لحد ما ترفعي الفرونت إند وتجيبي الرابط بتاعه حطيه هنا
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce Backend!');
});


app.use('/api/setup', setupRoutes);


app.use('/api/auth', authRoutes);


app.use('/api/users', userRoutes);


app.use('/api/cart', cartRoutes); 

app.use('/api/orders', orderRoutes);


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Access backend at: http://localhost:${PORT}`);
// });

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

module.exports = app;