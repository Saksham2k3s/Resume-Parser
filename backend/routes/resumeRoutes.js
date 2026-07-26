import express from "express";
import multer from "multer";
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// store file in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

export default router;