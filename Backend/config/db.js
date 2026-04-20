const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log("hello"+process.env.MONGO_URI)

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        console.log(process.env.MONGO_URI)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    
    }
};
module.exports = connectDB;
    