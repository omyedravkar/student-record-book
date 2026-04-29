const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Login Auth controllers
const login = async (req, res) => {
    try {
        // Finding User from Email
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        // Password checker
        if (req.body.password !== user.password) {
            return res.status(401).json({ success: false, message: 'Wrong password' })
        }

        // TOken
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

       res.json({ success: true, token: token, role: user.role, prn: user.prn, name: user.name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// Register - New User
const register = async (req, res) => {
    try {
        // Checking email already exist or not
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered ' })
        }

        const user = new User({
            prn: req.body.prn,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            branch: req.body.branch,
            year: req.body.year
        })

        await user.save()
        res.json({ success: true, message: 'User Successfully Registered' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { login, register }