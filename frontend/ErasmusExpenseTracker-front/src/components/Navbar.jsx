import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    const confirmed = window.confirm(t("confirmLogout"));
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-erasmus-blue text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-semibold">
        {t("appName")}
      </div>
      <div className="space-x-4">
        <Link to="/dashboard" className="hover:underline">🏠 {t("nav.home")}</Link>
        <Link to="/trips" className="hover:underline">✈️ {t("nav.trips")}</Link>
        <Link to="/transactions" className="hover:underline">💰 {t("nav.transactions")}</Link>
        <Link to="/statistics" className="hover:underline">📊 {t("nav.statistics")}</Link>
        <Link to="/budgets" className="hover:underline">🧾 {t("nav.budgets")}</Link>
        <Link to="/profile" className="hover:underline">👤 {t("nav.profile")}</Link>
        <button onClick={handleLogout} className="hover:underline">🚪 {t("nav.logout")}</button>
      </div>
    </nav>
  );
}
