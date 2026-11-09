const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const auditController = require("../controllers/auditController");

// Get audit logs for authorized user
router.get(
    "/",
    authenticateToken,
    auditController.getAuditLogs
);

module.exports = router;