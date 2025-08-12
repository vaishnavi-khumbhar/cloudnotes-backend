require('dotenv').config();
const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');

// Connect to MongoDB using Atlas connection from .env
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to iNotebook backend!');
});

// Middleware
app.use(cors({
    origin: "*" // Security साठी नंतर frontend URL टाक
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Test route
app.get('/ping', (req, res) => {
    res.send("Server is running");
});

// Start server
app.listen(port, () => {
    console.log(`iNotebook backend listening at http://localhost:${port}`);
});
