const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

const studentRecordRoutes = require('./routes/studentRecord')
app.use('/api/student-record', studentRecordRoutes)


const mentorRoutes = require('./routes/mentor')
app.use('/api/mentor', mentorRoutes)


// Login API 
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)