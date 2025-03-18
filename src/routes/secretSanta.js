const express = require("express");
const multer = require("multer");
const { uploadCSV, downloadCSV, processCSV } = require("../controllers/secretSanta");

const router = express.Router();
const upload = multer({ dest: "backend/uploads/" });

// router.post("/upload", upload.single("file"), uploadCSV);
router.post("/upload", upload.fields([{ name: "currentFile" }, { name: "previousFile" }]), processCSV);

router.get("/download", downloadCSV);

module.exports = router;

