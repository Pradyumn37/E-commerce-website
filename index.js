const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const flash = require('express-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRoutes = require('./src/routes/auth');
const products = require('./src/routes/product');
const cart = require('./src/routes/carts');
const index = require('./src/routes/index');
const sidebar = require('./src/routes/sidebar');
const confirmation = require('./src/routes/confirmation');
const uuid = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myplace_in', {

}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Initialize MongoStore with session
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/myplace_in',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // Session TTL (time to live) in seconds (1 day)
});

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a random string
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Session expires after 1 day
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Routes
app.get('/home', (req, res) => {
    res.render('home'); // Assumes home.ejs is in 'views' folder
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/products', products);
app.use('/', index);
app.use('/auth', authRoutes); // Mount authentication routes
app.use('/cart', cart);
app.use('/shop', sidebar);
app.use('/confirmation', confirmation);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
