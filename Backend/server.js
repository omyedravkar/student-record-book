const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const authRoutes = require('./routes/auth');
const studentRecordRoutes = require('./routes/studentRecord');
const mentorRoutes = require('./routes/mentor');

app.use('/api/auth', authRoutes);
app.use('/api/student-record', studentRecordRoutes);
app.use('/api/mentor', mentorRoutes);

// Temp test route to add user
const User = require('./models/User');
app.post('/test/adduser', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ message: "User saved", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/', (req, res) => res.send('Backend is running'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});