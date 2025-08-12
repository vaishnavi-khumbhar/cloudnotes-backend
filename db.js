const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);  // Deprecation warning 

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected to Atlas');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectToMongo;
