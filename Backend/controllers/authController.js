const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Login Auth controllers
const login = async (req, res) => {
    try {
        // Email se user dhundo
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User nahi mila' })
        }

        // Password check karo
        if (req.body.password !== user.password) {
            return res.status(401).json({ success: false, message: 'Wrong password' })
        }

        // Token banao
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

module.exports = { login }