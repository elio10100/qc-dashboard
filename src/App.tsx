import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import QualityInspection from "./pages/QualityInspection";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
        {/* Navigation Bar */}
        <nav className="bg-white p-4 rounded shadow mb-6 flex gap-6">
          <Link to="/" className="text-blue-600 hover:underline font-medium">Home</Link>
          <Link to="/inspection" className="text-blue-600 hover:underline font-medium">Quality Inspection</Link>
          <Link to="/reports" className="text-blue-600 hover:underline font-medium">Reports</Link>
          <Link to="/settings" className="text-blue-600 hover:underline font-medium">Settings</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<h1 className="text-2xl font-bold">Home</h1>} />
          <Route path="/inspection" element={<QualityInspection />} />
          <Route path="/reports" element={<h1 className="text-2xl font-bold">Reports</h1>} />
          <Route path="/settings" element={<h1 className="text-2xl font-bold">Settings</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
