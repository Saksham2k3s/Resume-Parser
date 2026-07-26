import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },

  rawText: { type: String }, // full extracted text, useful for debugging/re-parsing

  name: { type: String, default: "" },
  emails: [{ type: String }],
  phones: [{ type: String }],
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  address: { type: String, default: "" },

  skills: [{ type: String }],
  education: [{ type: String }],
  projects: [{ type: String }],
  experience: [{ type: String }],
  certifications: [{ type: String }],

  college: { type: String, default: "" },
  degree: { type: String, default: "" },
  graduationYear: { type: String, default: "" },
});

export default mongoose.model("Resume", resumeSchema);