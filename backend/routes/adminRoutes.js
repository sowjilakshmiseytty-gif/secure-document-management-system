
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// Get all users (Admin only)
router.get(
    "/users",
    authenticateToken,
    requireAdmin,
    adminController.getAllUsers
);

module.exports = router;