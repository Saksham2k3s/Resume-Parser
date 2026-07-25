import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getResumes, uploadResume, deleteResume } from "../api/client";

function fileExt(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [education, setEducation] = useState("");

  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (education) params.education = education;
      const res = await getResumes(params);
      setResumes(res.data);
    } catch (err) {
      setError("Failed to load resumes. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [search, skill, education]);

  useEffect(() => {
    const timer = setTimeout(() => loadResumes(), 300); // debounce filters
    return () => clearTimeout(timer);
  }, [loadResumes]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      await uploadResume(file);
      await loadResumes();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      await loadResumes();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">RP</div>
          <div>
            <h1>Resume Management System</h1>
            <p className="subtitle">Upload, parse, search and manage candidate resumes</p>
          </div>
        </div>

        <label className="upload-btn" data-disabled={uploading}>
          {uploading ? "Uploading…" : "+ Upload Resume"}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <input
          className="filter-input"
          placeholder="Filter by skill (e.g. react)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <input
          className="filter-input"
          placeholder="Filter by college/education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading resumes…</div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📄</div>
          <p>No resumes found. Upload a PDF to get started.</p>
        </div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Skills</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => (
                <tr key={r._id}>
                  <td>
                    <span className="filetype-badge">{fileExt(r.fileName)}</span>
                    <Link className="filename-link" to={`/resume/${r._id}`}>
                      {r.name || r.fileName}
                    </Link>
                  </td>
                  <td className="mono" style={{ fontSize: 12.5 }}>
                    {r.emails?.[0] || "—"}
                  </td>
                  <td className="mono" style={{ fontSize: 12.5 }}>
                    {r.phones?.[0] || "—"}
                  </td>
                  <td>
                    <div className="chip-list">
                      {(r.skills || []).slice(0, 3).map((s) => (
                        <span key={s} className="skill-chip">{s}</span>
                      ))}
                      {r.skills?.length > 3 && (
                        <span className="skill-chip">+{r.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12.5 }}>
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={(e) => handleDelete(r._id, e)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;