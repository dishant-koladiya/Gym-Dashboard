const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Gym Backend Skeleton Ready"
    });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;