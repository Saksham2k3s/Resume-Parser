// pulls structured fields out of raw resume text using regex + keyword matching

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const LINKEDIN_REGEX = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_/]+/gi;
const GITHUB_REGEX = /(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-_/]+/gi;

// common skills list to match against
const SKILL_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust",
  "react", "react.js", "next.js", "vue", "vue.js", "angular", "redux", "tailwind",
  "node.js", "node", "express", "express.js", "django", "flask", "spring", "spring boot",
  "mongodb", "mysql", "postgresql", "postgres", "redis", "sqlite", "firebase", "supabase",
  "aws", "gcp", "azure", "docker", "kubernetes", "ci/cd", "jenkins", "git", "github",
  "html", "css", "sass", "bootstrap", "graphql", "rest api", "websocket",
  "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy",
  "jira", "agile", "scrum", "figma",
];

// section headers to split the resume into chunks
const SECTION_HEADERS = {
  education: /education/i,
  experience: /experience|employment|work history/i,
  projects: /projects/i,
  skills: /skills|technical skills/i,
  certifications: /certifications?|licenses/i,
};

export function extractEmails(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  return [...new Set(matches.map((e) => e.toLowerCase()))];
}

export function extractPhones(text) {
  const matches = text.match(PHONE_REGEX) || [];
  // filter out short false-positive matches (like years, zip codes accidentally matched)
  const cleaned = matches
    .map((m) => m.trim())
    .filter((m) => m.replace(/[^0-9]/g, "").length >= 10);
  return [...new Set(cleaned)];
}

export function extractLinkedIn(text) {
  const match = text.match(LINKEDIN_REGEX);
  return match ? match[0] : "";
}

export function extractGithub(text) {
  const match = text.match(GITHUB_REGEX);
  return match ? match[0] : "";
}

// name is trickiest without AI - assume its the first non-empty line
// that isn't an email/phone/url (usually true for most resume formats)
export function extractName(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (
      !EMAIL_REGEX.test(line) &&
      !line.match(PHONE_REGEX) &&
      !line.match(LINKEDIN_REGEX) &&
      !line.match(GITHUB_REGEX) &&
      line.length < 60 &&
      line.length > 2
    ) {
      return line;
    }
  }
  return "";
}

export function extractSkills(text) {
  const lowerText = text.toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => lowerText.includes(skill));
}

// splits resume text into sections based on common headers, returns raw chunks
function splitIntoSections(text) {
  const lines = text.split("\n");
  const sections = {};
  let currentSection = null;
  let buffer = [];

  for (const line of lines) {
    let matchedHeader = null;
    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(line) && line.trim().length < 40) {
        matchedHeader = key;
        break;
      }
    }

    if (matchedHeader) {
      if (currentSection) sections[currentSection] = buffer.join("\n").trim();
      currentSection = matchedHeader;
      buffer = [];
    } else if (currentSection) {
      buffer.push(line);
    }
  }
  if (currentSection) sections[currentSection] = buffer.join("\n").trim();

  return sections;
}

// breaks a section's raw text into a list of bullet-like entries
function splitIntoEntries(sectionText) {
  if (!sectionText) return [];
  return sectionText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
}

export function extractEducation(sections) {
  return splitIntoEntries(sections.education);
}

export function extractExperience(sections) {
  return splitIntoEntries(sections.experience);
}

export function extractProjects(sections) {
  return splitIntoEntries(sections.projects);
}

export function extractCertifications(sections) {
  return splitIntoEntries(sections.certifications);
}

export function extractCollege(sections) {
  const eduText = sections.education || "";
  // match the whole line containing a college keyword, not just from the keyword onward
  const lines = eduText.split("\n");
  for (const line of lines) {
    if (/university|college|institute|iit|nit|polytechnic/i.test(line)) {
      return line.trim();
    }
  }
  return "";
}

export function extractDegree(sections) {
  const eduText = sections.education || "";
  const degreeMatch = eduText.match(
    /(b\.?\s?tech|m\.?\s?tech|bachelor of [a-z\s]+|master of [a-z\s]+|bca|mca|b\.?e\.?|m\.?e\.?|bsc|msc|phd)/i
  );
  if (!degreeMatch) return "";
  // strip any trailing date range that might still be attached (e.g. "Aug 2025 – June 2027")
  return degreeMatch[0].replace(/\s*(19|20)\d{2}.*$/, "").trim();
}

export function extractGraduationYear(sections) {
  const eduText = sections.education || "";
  const yearMatch = eduText.match(/(20\d{2}|19\d{2})/);
  return yearMatch ? yearMatch[0] : "";
}

// main entry point - takes raw pdf text, returns all extracted fields
export function parseResumeText(rawText) {
  const sections = splitIntoSections(rawText);

  return {
    name: extractName(rawText),
    emails: extractEmails(rawText),
    phones: extractPhones(rawText),
    linkedin: extractLinkedIn(rawText),
    github: extractGithub(rawText),
    skills: extractSkills(rawText),
    education: extractEducation(sections),
    experience: extractExperience(sections),
    projects: extractProjects(sections),
    certifications: extractCertifications(sections),
    college: extractCollege(sections),
    degree: extractDegree(sections),
    graduationYear: extractGraduationYear(sections),
  };
}



