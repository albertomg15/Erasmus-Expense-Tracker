import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (confirmed) {
    logout();
    navigate("/login");
  }
};


  return (
    <nav className="bg-erasmus-blue text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-semibold">
        Erasmus Expense Tracker
      </div>
      <div className="space-x-4">
  <Link to="/dashboard" className="hover:underline">
    🏠 Home
  </Link>
  <Link to="/trips" className="hover:underline">
    ✈️ Trips
  </Link>
  <Link to="/transactions" className="hover:underline">
    💰 Transactions
  </Link>
  <Link to="/statistics" className="hover:underline">
    📊 Statistics
  </Link>
  <Link to="/profile" className="hover:underline">
    👤 Edit Profile
  </Link>
  <button onClick={handleLogout} className="hover:underline">
    🚪 Logout
  </button>
</div>


    </nav>
  );

}
