import axios from "axios";

const API_BASE_URL = "https://resume-parser-backend-opmy.onrender.com/api";

const api = axios.create({ baseURL: API_BASE_URL });

export const getResumes = (params) => api.get("/resumes", { params });
export const getResume = (id) => api.get(`/resumes/${id}`);
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return api.post("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

export default api;