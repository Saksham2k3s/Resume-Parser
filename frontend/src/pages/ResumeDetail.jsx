import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getResume, deleteResume } from "../api/client";

function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getResume(id);
        setResume(res.data);
      } catch (err) {
        setError("Failed to load resume");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this resume permanently?")) return;
    try {
      await deleteResume(id);
      navigate("/");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="page loading-state">Loading…</div>;
  if (error) return <div className="page error-banner">{error}</div>;
  if (!resume) return null;

  return (
    <div className="page">
      <Link className="back-link" to="/">← Back to Dashboard</Link>

      <div className="detail-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>{resume.name || resume.fileName}</h1>
          <p className="subtitle">
            Uploaded {new Date(resume.uploadedAt).toLocaleString()}
          </p>
        </div>
        <button className="delete-btn" onClick={handleDelete}>Delete Resume</button>
      </div>

      <div className="table-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="section-title">Contact & Links</p>
        <div className="field-row">
          <div className="field-label">Emails</div>
          <div className="field-value">{resume.emails?.join(", ") || "—"}</div>
        </div>
        <div className="field-row">
          <div className="field-label">Phone</div>
          <div className="field-value">{resume.phones?.join(", ") || "—"}</div>
        </div>
        <div className="field-row">
          <div className="field-label">LinkedIn</div>
          <div className="field-value">
            {resume.linkedin ? <a href={`https://${resume.linkedin.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{resume.linkedin}</a> : "—"}
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">GitHub</div>
          <div className="field-value">
            {resume.github ? <a href={`https://${resume.github.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{resume.github}</a> : "—"}
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">Resume File</div>
          <div className="field-value"><a href={resume.fileUrl} target="_blank" rel="noreferrer">View original PDF</a></div>
        </div>
      </div>

      <div className="table-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="section-title">Education</p>
        <div className="field-row">
          <div className="field-label">College</div>
          <div className="field-value">{resume.college || "—"}</div>
        </div>
        <div className="field-row">
          <div className="field-label">Degree</div>
          <div className="field-value">{resume.degree || "—"}</div>
        </div>
        <div className="field-row">
          <div className="field-label">Graduation Year</div>
          <div className="field-value">{resume.graduationYear || "—"}</div>
        </div>
      </div>

      <div className="table-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="section-title">
          Skills <span className="count">({resume.skills?.length || 0})</span>
        </p>
        <div className="chip-list">
          {(resume.skills || []).map((s) => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
          {(!resume.skills || resume.skills.length === 0) && <p className="subtitle">No skills detected</p>}
        </div>
      </div>

      <div className="table-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="section-title">Experience</p>
        <ul className="entry-list">
          {(resume.experience || []).map((line, i) => <li key={i}>{line}</li>)}
          {(!resume.experience || resume.experience.length === 0) && <p className="subtitle">No experience section detected</p>}
        </ul>
      </div>

      <div className="table-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
        <p className="section-title">Projects</p>
        <ul className="entry-list">
          {(resume.projects || []).map((line, i) => <li key={i}>{line}</li>)}
          {(!resume.projects || resume.projects.length === 0) && <p className="subtitle">No projects section detected</p>}
        </ul>
      </div>

      <div className="table-card" style={{ padding: "18px 20px" }}>
        <p className="section-title">Certifications</p>
        <ul className="entry-list">
          {(resume.certifications || []).map((line, i) => <li key={i}>{line}</li>)}
          {(!resume.certifications || resume.certifications.length === 0) && <p className="subtitle">No certifications detected</p>}
        </ul>
      </div>
    </div>
  );
}

export default ResumeDetail;