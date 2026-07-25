# Resume Management System

A full-stack app where users upload PDF resumes, which get automatically parsed into
structured fields (name, contact info, skills, education, experience, projects,
certifications) using traditional regex/rule-based extraction — no LLM or Generative AI
used for parsing, per the assignment's explicit requirement.

Built for the Mindstack SDE-1 assignment.

**Live app:** [add your deployed frontend URL here]
**Backend API:** [add your deployed backend URL here]

---

## Tech Stack

- **Backend:** Node.js + Express (MERN stack, per requirement)
- **Database:** MongoDB (MongoDB Atlas, free tier), via Mongoose
- **Cloud storage:** Supabase Storage (used for storing uploaded PDF files)
- **PDF text extraction:** `pdf-parse`
- **Field extraction:** Pure regex + keyword/section-header matching — explicitly
  **no LLM/Generative AI** used anywhere in the extraction pipeline, per assignment rules
- **Frontend:** React (Vite), React Router, Axios, plain CSS
- **Testing:** Node's built-in test runner (`node --test`)

---

## Project Structure

```
resume-parser-mern/
├── backend/
│   ├── config/          # db.js (mongoose), supabase.js (storage client)
│   ├── controllers/      # resumeController.js - upload, list, get, delete logic
│   ├── models/            # Resume.js - mongoose schema
│   ├── routes/            # resumeRoutes.js
│   ├── utils/              # parser.js - the regex-based field extraction engine
│   ├── tests/               # parser.test.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard.jsx, ResumeDetail.jsx
│   │   ├── api/              # client.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## Setup & Run Locally

### Prerequisites

- Node.js 18+
- A MongoDB Atlas account (free tier) or any MongoDB instance
- A Supabase account (free tier) with Storage enabled

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example` for the template):

```
PORT=5000
MONGO_URI=your-mongodb-connection-string
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
```

**Supabase setup note:** create a Storage bucket named `resumes` (public), and add two
storage policies allowing `INSERT` and `SELECT` for the `anon` role with the condition
`bucket_id = 'resumes'` — required since we use the public/anon key, not an admin key,
and Supabase Storage has Row Level Security enabled by default.

Start the server:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. Update `src/api/client.js` if your backend
runs elsewhere (e.g. after deployment).

### 3. Running tests

```bash
cd backend
npm test
```

Tests cover the regex-based extraction functions (emails, phones, LinkedIn, GitHub,
skills, name detection) — the core logic this assignment evaluates for parsing accuracy.

---

## Assumptions Made

- **No LLM/AI used anywhere in parsing**, per the assignment's explicit instruction —
  all field extraction is regex and keyword/section-header based.
- **Name extraction** assumes the candidate's name appears as one of the first few
  non-empty lines of the resume, and is not an email/phone/URL — true for the vast
  majority of standard resume formats, but not guaranteed for unconventional layouts.
- **Skills are matched against a predefined keyword list** (common languages,
  frameworks, tools) rather than extracted generically — this avoids false positives
  from matching random words, at the cost of missing skills not on the list.
- **Section detection (Education/Experience/Projects/Certifications)** relies on
  recognizing common section header text (e.g. "Education", "Experience") — resumes
  that use unconventional or missing headers may not have those sections parsed correctly.
- **Only PDF files are accepted** (max 5MB), per the assignment spec — scanned/image-based
  PDFs with no embedded text layer cannot be parsed, since there's no OCR step (out of
  scope given the no-AI constraint and time available).
- **Multiple emails/phones on a resume are all captured** (not just the first), since
  candidates sometimes list both a personal and college email, for example.

---

## Design Decisions & Trade-offs

### Why regex/rule-based parsing (beyond just following the requirement)

Beyond being explicitly required, rule-based parsing is deterministic and free —
the same resume always extracts the same fields, with no API cost or latency per
upload. The trade-off is lower recall on resumes with unusual formatting, which
is documented above rather than hidden.

### Why Supabase Storage instead of Cloudinary

Cloudinary was the original plan, but ran into account-level restrictions during
setup (PDF/raw file delivery disabled by default on new free accounts, plus an
unresolved API credential issue). Supabase Storage was used instead — it's
explicitly listed as an acceptable option in the assignment brief, and offers the
same core capability (upload a file, get back a public URL to store in the database).

### Why files are stored in Supabase, and only the URL is stored in MongoDB

Same reasoning as any object-storage pattern: MongoDB stores structured, queryable
data (parsed fields, metadata), while the actual PDF binary lives in object storage
built for that purpose. The database only stores a reference URL, keeping documents
small and fast to query.

### In-memory file handling (no local disk writes)

Uploaded files are processed entirely in memory (via Multer's memory storage) —
the buffer is passed directly to both the PDF parser and the Supabase upload call,
with no temporary file written to the server's disk. This is simpler and avoids
cleanup logic for temp files.

### Search & filters (bonus)

- **Search** matches against name, email, and phone fields (case-insensitive regex).
- **Skill filter** matches if the requested skill appears anywhere in the extracted
  skills array.
- **Education filter** matches against the extracted college field.
- Filters are combined server-side in a single MongoDB query rather than fetching
  everything and filtering client-side, so it stays reasonably efficient as the
  resume count grows.

---

## API Endpoints

| Method | Endpoint              | Description                                                                                                |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| POST   | `/api/resumes/upload` | Upload a PDF resume; runs the full pipeline (extract text → parse fields → upload to storage → save to DB) |
| GET    | `/api/resumes`        | List resumes; supports `?search=`, `?skill=`, `?education=`, `?fromDate=`, `?toDate=` query params         |
| GET    | `/api/resumes/:id`    | Get one resume with full parsed detail                                                                     |
| DELETE | `/api/resumes/:id`    | Delete a resume (bonus)                                                                                    |

---

## Known Limitations / What I'd Improve With More Time

- **College/degree extraction** can still be imperfect on resumes with unconventional
  education formatting — regex captures the most common patterns (e.g. "University",
  "B.Tech", "Master of X") but isn't exhaustive across every possible resume format.
- **No OCR support** — scanned/image-only PDFs (no embedded text layer) can't be parsed,
  since OCR libraries add complexity and the assignment's no-AI constraint rules out
  AI-based OCR specifically.
- **Skill list is static** — a resume using a skill not in the predefined keyword list
  won't be detected. A larger, more comprehensive keyword list would improve recall.
- **No pagination on the resume list** — fine for a demo/assignment scale, would need
  it for a large production dataset.

---

## Deployment Notes

Free-tier hosting used for both frontend and backend. **Free-tier services may "sleep"
after inactivity and take 20-30 seconds to respond on first load** — expected behavior,
not a bug, if the live demo feels slow initially.
