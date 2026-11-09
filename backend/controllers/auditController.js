

const pool = require("../config/db");

// Record an audit event
exports.logAudit = async (userId, documentId, action, details = "") => {
    try {
        await pool.query(
            `INSERT INTO audit_logs
             (user_id, document_id, action, details)
             VALUES ($1, $2, $3, $4)`,
            [userId, documentId, action, details]
        );

        

    } catch (error) {
        console.error("Audit log error:", error.message);
        throw error;
    }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Debug: Logged-in user details
        

        const result = await pool.query(
            `SELECT
                a.id,
                a.user_id,
                u.name AS user_name,
                a.document_id,
                d.filename,
                a.action,
                a.details,
                a.created_at
             FROM audit_logs a
             LEFT JOIN users u
                ON a.user_id = u.id
             LEFT JOIN documents d
                ON a.document_id = d.id
             WHERE
                $1 = 'admin'
                OR a.user_id = $2
                OR d.owner_id = $2
             ORDER BY a.created_at DESC`,
            [userRole, userId]
        );

        // Debug: Number of records returned
        

        return res.status(200).json({
            message: "Audit logs retrieved successfully",
            totalLogs: result.rows.length,
            logs: result.rows
        });

    } catch (error) {
        console.error("Get audit logs error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve audit logs"
        });
    }
};
