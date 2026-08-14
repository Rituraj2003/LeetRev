import { Navigate, useSearchParams } from "react-router-dom";
import { saveAuthToken } from "../services/api";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return <p className="p-8 text-sm text-[#A8553F]">GitHub sign-in did not return a session. Please try again.</p>;
  }

  saveAuthToken(token);
  return <Navigate to="/setup" replace />;
}
