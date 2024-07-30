const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/users");
const expenseRoutes = require("./routes/expenses");
const authMiddleware = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/expenses", authMiddleware, expenseRoutes); // Protected route

// Connect to MongoDB
mongoose
    .connect(
        "mongodb+srv://asblaster100:personal-finance-manager@cluster0.rlvgkqi.mongodb.net/",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
