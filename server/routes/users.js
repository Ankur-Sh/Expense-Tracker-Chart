const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        const token = user.generateAuthToken();
        res.status(201).json({ token });
    } catch (err) {
        res.status(400).json(err);
    }
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        const token = user.generateAuthToken();
        res.json({ token });
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
