const pool = require("../config/db");

// Get all registered users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            message: "Users retrieved successfully",
            totalUsers: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error("Admin users error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve users"
        });
    }
};