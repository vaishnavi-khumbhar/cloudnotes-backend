const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser'); 
const sendMail = require("../utils/sendMail"); 

const JWT_SECRET = 'sharvilisagoodb$oy';

router.post('/testtoken', fetchuser, (req, res) => {
    console.log("/testtoken hit");
    res.json({ message: "Token working!", userId: req.user.id });
});

// ROUTE 1: Create a User using: POST "api/auth/createuser"
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(" Validation Error:", errors.array());
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            console.log("Signup blocked: Email already exists:", req.body.email);
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            profilePhoto: "/default-avatar.png", 
            lastLogin: Date.now()                
        });

        console.log(" User Created:", user.email);

        const data = { user: { id: user.id } };
        const authtoken = jwt.sign(data, JWT_SECRET);

        // Send welcome email 
        console.log(` Sending welcome email to: ${req.body.email}`);
        try {
            const htmlContent = `
            <div style="background-color:#f4f4f4; padding:20px; font-family: Arial, sans-serif;">
              <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
                <div style="background:#0d6efd; padding:15px; text-align:center; border-top-left-radius:8px; border-top-right-radius:8px;">
                </div>
                <div style="padding:20px; color:#333;">
                  <h2 style="color:#0d6efd;">Welcome to CloudMind, ${req.body.name}! 🎉</h2>
                  <p>Thank you for joining <b>CloudMind</b>. Your personal cloud notebook is ready!</p>
                  <ul>
                    <li>📌 Create and organize your notes easily</li>
                    <li>🔒 Keep your data secure in the cloud</li>
                    <li>☁️ Access your notes from anywhere</li>
                  </ul>
                  <div style="text-align:center; margin-top:30px;">
                    <a href="http://localhost:3000" 
                       style="background:#0d6efd; color:white; padding:12px 25px; text-decoration:none; 
                              font-weight:bold; border-radius:5px; display:inline-block;">
                      Go to iNotebook
                    </a>
                  </div>
                  <p style="margin-top:30px; font-size:13px; color:#777;">If you didn't sign up, please ignore this email.</p>
                </div>
                <div style="background:#f4f4f4; padding:10px; text-align:center; font-size:12px; color:#999;">
                  © ${new Date().getFullYear()} CloudMind☁️. All rights reserved.
                </div>
              </div>
            </div>
            `;

            await sendMail(
                req.body.email,
                "🎉 Welcome to CloudMind ☁️",
                null,
                htmlContent
            );

            console.log(`✅ Welcome email sent to: ${req.body.email}`);
        } catch (mailError) {
            console.error(`Failed to send welcome email to: ${req.body.email}`);
            console.error(`Error: ${mailError.message}`);
        }
        
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(" Signup route error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Authenticate a User using: POST "api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(" Login validation error:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log(" Login failed: No user found for", email);
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            console.log(" Login failed: Incorrect password for", email);
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        user.lastLogin = Date.now();
        await user.save();

        const data = { user: { id: user.id } };
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;

        console.log("✅ Login successful for:", email);
        res.json({ success, authtoken });

    } catch (error) {
        console.error(" Login route error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Get logged-in user details using: POST "/api/auth/getuser"
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).select("-password"); 
        console.log(" getUser called for userId:", userId);
        res.send(user);
    } catch (error) {
        console.error(" getUser route error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
