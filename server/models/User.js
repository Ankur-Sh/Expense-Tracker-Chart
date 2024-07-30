const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare passwords
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Generate JWT
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, "secret", { expiresIn: "1h" });
};

module.exports = mongoose.model("User", UserSchema);
