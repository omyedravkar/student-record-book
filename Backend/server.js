const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(express.json());
app.use(cors());

const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const authRoutes = require('./routes/auth');
const studentRecordRoutes = require('./routes/studentRecord');
const mentorRoutes = require('./routes/mentor');
const User = require('./models/User');
const recruiterRoutes = require('./routes/recruiter')
const erpRoutes = require('./routes/erp')

app.use('/api/auth', authRoutes);
app.use('/api/student-record', studentRecordRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/erp', erpRoutes)
app.use('/api/recruiter', recruiterRoutes)

// Temp test route to add user
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


connectDB()
.then(()=>{
  app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
})
.catch((e)=>{
  console.log("error: ",e)
})
