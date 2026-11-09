

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config({ path: "../.env" });

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const auditRoutes = require("./routes/auditRoutes");
const adminRoutes = require("./routes/adminRoutes");
const requireAdmin = require("./middleware/adminMiddleware");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "TrustVault API is running successfully"
    });
});

// Database health check
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT current_database()");

        res.json({
            status: "OK",
            database: result.rows[0].current_database
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Authentication routes
app.use("/api/auth", authRoutes);
// Admin routes - authentication and admin role required
app.use(
    "/api/admin",
    authenticateToken,
    requireAdmin,
    adminRoutes
);
// Current logged-in user
app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({
        message: "Authenticated successfully",
        user: req.user
    });
});

// Document routes
app.use("/api/documents", documentRoutes);

// Audit routes
app.use("/api/audit", auditRoutes);
console.log("AUDIT ROUTE REGISTERED");
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("TrustVault server running at http://localhost:" + PORT);
});
