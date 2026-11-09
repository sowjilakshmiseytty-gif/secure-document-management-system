
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const auditController = require("./auditController");

// Get documents accessible to logged-in user
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT DISTINCT d.id, d.filename, d.created_at
             FROM documents d
             LEFT JOIN document_permissions p
             ON d.id = p.document_id
             WHERE d.owner_id = $1
             OR (p.user_id = $1 AND p.can_view = true)
             ORDER BY d.created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            message: "Documents retrieved successfully",
            documents: result.rows
        });

    } catch (error) {
        console.error("Get documents error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve documents"
        });
    }
};


// Upload document
exports.uploadDocument = async (req, res) => {

    if (req.user.role !== "user") {
        return res.status(403).json({
            message: "Only Document Owners can upload documents."
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Please upload a PDF file."
        });
    }

    try {
        const userId = req.user.id;
        const originalName = path.basename(req.file.originalname);

        const result = await pool.query(
            `INSERT INTO documents (owner_id, filename, storage_path)
             VALUES ($1, $2, $3)
             RETURNING id, filename, created_at`,
            [userId, originalName, req.file.filename]
        );

        // Record upload audit
        try {
            await auditController.logAudit(
                userId,
                result.rows[0].id,
                "UPLOAD",
                "Uploaded document: " + originalName
            );
        } catch (auditError) {
            console.error("Upload audit error:", auditError.message);
        }

        return res.status(201).json({
            message: "Document uploaded successfully",
            document: result.rows[0]
        });

    } catch (error) {
        fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError) {
                console.error("File cleanup error:", unlinkError.message);
            }
        });

        console.error("Upload error:", error.message);

        return res.status(500).json({
            message: "Document upload failed"
        });
    }
};


// Download document securely
exports.downloadDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const result = await pool.query(
            `SELECT d.filename, d.storage_path
             FROM documents d
             LEFT JOIN document_permissions p
             ON d.id = p.document_id
             AND p.user_id = $2
             WHERE d.id = $1
             AND (
                 d.owner_id = $2
                 OR p.can_download = true
             )`,
            [documentId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Document not found or download permission denied"
            });
        }

        const document = result.rows[0];

        const uploadDir = path.resolve(
            __dirname,
            "../../private_uploads"
        );

        const safeFilename = path.basename(document.storage_path);
        const filePath = path.resolve(uploadDir, safeFilename);

        if (path.dirname(filePath) !== uploadDir) {
            return res.status(400).json({
                message: "Invalid document path"
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Stored file not found"
            });
        }

        // Send file and record audit after successful transfer
        return res.download(
            filePath,
            document.filename,
            async (error) => {

                if (error) {
                    console.error("Download error:", error.message);

                    if (!res.headersSent) {
                        res.status(500).json({
                            message: "Document download failed"
                        });
                    }

                    return;
                }

                try {
                    await auditController.logAudit(
                        userId,
                        documentId,
                        "DOWNLOAD",
                        "Downloaded document: " + document.filename
                    );
                } catch (auditError) {
                    console.error(
                        "Download audit error:",
                        auditError.message
                    );
                }
            }
        );

    } catch (error) {
        console.error("Download controller error:", error.message);

        return res.status(500).json({
            message: "Unable to download document"
        });
    }
};


// Share document with another user
exports.shareDocument = async (req, res) => {
    if (req.user.role !== "user") {
    return res.status(403).json({
        message: "Only Document Owners can share documents."
    });
}
    try {
        const ownerId = req.user.id;
        const documentId = Number(req.params.id);

        const { email, can_view, can_download } = req.body;

        if (!Number.isSafeInteger(documentId) || documentId <= 0) {
            return res.status(400).json({
                message: "Invalid document ID"
            });
        }

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof can_view !== "boolean" ||
            typeof can_download !== "boolean"
        ) {
            return res.status(400).json({
                message: "Email and valid permissions are required"
            });
        }

        if (can_download && !can_view) {
            return res.status(400).json({
                message: "Download permission requires view permission"
            });
        }

        // Only document owner can share
        const document = await pool.query(
            `SELECT id FROM documents
             WHERE id = $1 AND owner_id = $2`,
            [documentId, ownerId]
        );

        if (document.rows.length === 0) {
            return res.status(404).json({
                message: "Document not found or you are not the owner"
            });
        }

        // Find recipient
        const recipient = await pool.query(
    `SELECT id FROM users
     WHERE LOWER(email) = LOWER($1)
     AND role = 'recipient'`,
    [email.trim()]
);

        if (recipient.rows.length === 0) {
            return res.status(404).json({
                message: "Recipient user not found"
            });
        }

        const recipientId = recipient.rows[0].id;

        if (recipientId === ownerId) {
            return res.status(400).json({
                message: "You cannot share a document with yourself"
            });
        }

        // Insert or update document permissions
        const result = await pool.query(
            `INSERT INTO document_permissions
             (document_id, user_id, can_view, can_download)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (document_id, user_id)
             DO UPDATE SET
                can_view = EXCLUDED.can_view,
                can_download = EXCLUDED.can_download
             RETURNING document_id, user_id, can_view, can_download`,
            [documentId, recipientId, can_view, can_download]
        );

        // Record share audit
        try {
            await auditController.logAudit(
                ownerId,
                documentId,
                "SHARE",
                "Shared with: " + email.trim() +
                ", can_view: " + can_view +
                ", can_download: " + can_download
            );
        } catch (auditError) {
            console.error("Share audit error:", auditError.message);
        }

        return res.status(200).json({
            message: "Document shared successfully",
            permission: result.rows[0]
        });

    } catch (error) {
        console.error("Share document error:", error.message);

        return res.status(500).json({
            message: "Unable to share document"
        });
    }
};