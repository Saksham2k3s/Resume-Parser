import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ResumeDetail from "./pages/ResumeDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resume/:id" element={<ResumeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;