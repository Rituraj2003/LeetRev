import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div>
      <Link to="/">Dashboard</Link>
      <Link to="/reviews">Reviews</Link>
    </div>
  );
}