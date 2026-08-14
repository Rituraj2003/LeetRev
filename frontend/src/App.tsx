import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import Reviews from "./pages/Reviews";
import ProblemWorkspace from "./pages/ProblemWorkspace";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import RepositorySetup from "./pages/RepositorySetup";
import { getAuthToken } from "./services/api";

function ProtectedLayout() {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <SideBar />
      <main className="ml-52 flex-1 min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/setup" element={<RepositorySetup />} />
          <Route path="/problems/:problemId" element={<ProblemWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
