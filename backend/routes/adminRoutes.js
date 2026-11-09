const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// Get all users
router.get("/users", adminController.getAllUsers);

module.exports = router;