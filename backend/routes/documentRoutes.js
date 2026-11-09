

const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const documentController = require("../controllers/documentController");

const {
    upload,
    validatePDF
} = require("../middleware/uploadMiddleware");

// Get documents accessible to logged-in user
router.get(
    "/",
    authenticateToken,
    documentController.getDocuments
);

// Upload a PDF document
router.post(
    "/upload",
    authenticateToken,
    (req, res, next) => {
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only Document Owners can upload documents."
            });
        }

        next();
    },
    upload.single("document"),
    validatePDF,
    documentController.uploadDocument
);

// Share document with another user
router.post(
    "/:id/share",
    authenticateToken,
    documentController.shareDocument
);

// Download document securely
router.get(
    "/:id/download",
    authenticateToken,
    documentController.downloadDocument
);

module.exports = router;
