import { PDFParse } from "pdf-parse";
import supabase from "../config/supabase.js";
import Resume from "../models/Resume.js";
import { parseResumeText } from "../utils/parser.js";

// uploads pdf to supabase, extracts text, parses fields, saves everything
export async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // extract raw text from the pdf buffer (in memory, no disk write)
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const rawText = pdfData.text;
    await parser.destroy(); // cleanup, per pdf-parse v2 docs

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF - it may be scanned/image-based" });
    }

    // upload the actual pdf file to supabase storage
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, req.file.buffer, {
        contentType: "application/pdf",
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(fileName);
    const fileUrl = urlData.publicUrl;

    // run our regex-based parser on the extracted text
    const parsedFields = parseResumeText(rawText);

    const resume = await Resume.create({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      rawText,
      ...parsedFields,
    });

    res.status(201).json(resume);
  } catch (err) {
    console.error("resume upload failed:", err);
    res.status(500).json({ error: err.message || "Failed to process resume" });
  }
}

// list all resumes, with optional search + filters
export async function getResumes(req, res) {
  try {
    const { search, skill, education, fromDate, toDate } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { emails: { $regex: search, $options: "i" } },
        { phones: { $regex: search, $options: "i" } },
      ];
    }

    if (skill) {
      query.skills = { $regex: skill, $options: "i" };
    }

    if (education) {
      query.$or = query.$or || [];
      query.college = { $regex: education, $options: "i" };
    }

    if (fromDate || toDate) {
      query.uploadedAt = {};
      if (fromDate) query.uploadedAt.$gte = new Date(fromDate);
      if (toDate) query.uploadedAt.$lte = new Date(toDate);
    }

    const resumes = await Resume.find(query).sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error("failed to fetch resumes:", err);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
}

// get one resume with full details
export async function getResumeById(req, res) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json(resume);
  } catch (err) {
    console.error("failed to fetch resume:", err);
    res.status(404).json({ error: "Resume not found" });
  }
}

// delete a resume
export async function deleteResume(req, res) {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json({ message: "Resume deleted" });
  } catch (err) {
    console.error("failed to delete resume:", err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
}