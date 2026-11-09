
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Private storage folder
const uploadDir = path.resolve(__dirname, "../../private_uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Store files using random names
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName = crypto.randomUUID() + ".pdf";
        cb(null, uniqueName);
    }
});

// Allow PDF files only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed."));
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Validate actual PDF file signature
function validatePDF(req, res, next) {
    

    if (!req.file) {
        return res.status(400).json({
            message: "Please select a PDF file."
        });
    }

    try {
        const fd = fs.openSync(req.file.path, "r");
        const header = Buffer.alloc(5);

        try {
            const bytesRead = fs.readSync(fd, header, 0, 5, 0);
            const signature = header.toString("ascii", 0, bytesRead);

            

            if (signature !== "%PDF-") {
                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    message: "Invalid PDF file. Please upload a genuine PDF."
                });
            }
        } finally {
            fs.closeSync(fd);
        }

        next();

    } catch (error) {
        console.error("PDF validation error:", error.message);

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: "Unable to validate uploaded file."
        });
    }
}

module.exports = {
    upload,
    validatePDF
};