const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.routes");
const memberRouter = require("./routes/member.routes");
const membershipRouter = require("./routes/membership.routes");
const paymentRouter = require("./routes/payment.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/members", memberRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Gym Backend Ready"
    });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;