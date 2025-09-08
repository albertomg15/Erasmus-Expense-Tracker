import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    if (window.confirm(t("confirmLogout"))) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      {/* Top bar fija y baja en móvil */}
      <header className="fixed top-0 inset-x-0 z-40 h-12 md:h-14 bg-erasmus-blue text-white shadow-md">
        <div className="h-full mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold truncate">
            {t("appName")}
          </Link>

          {/* Acciones primarias: iconos en móvil, texto en desktop */}
          <nav className="flex items-center gap-1 md:gap-2">
            {/* En móviles solo iconos para ahorrar altura */}
            <Link to="/transactions/new" className="p-2 md:hidden" aria-label={t("nav.newTransaction")}>➕</Link>
            <Link to="/statistics" className="p-2 md:hidden" aria-label={t("nav.statistics")}>📊</Link>

            {/* Menú completo en desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard" className="hover:underline">🏠 {t("nav.home")}</Link>
              <Link to="/trips" className="hover:underline">✈️ {t("nav.trips")}</Link>
              <Link to="/transactions" className="hover:underline">💰 {t("nav.transactions")}</Link>
              <Link to="/statistics" className="hover:underline">📊 {t("nav.statistics")}</Link>
              <Link to="/budgets" className="hover:underline">🧾 {t("nav.budgets")}</Link>
              <Link to="/comparison" className="hover:underline">🌍 {t("nav.comparison")}</Link>
              <Link to="/profile" className="hover:underline">👤 {t("nav.profile")}</Link>
              <button onClick={handleLogout} className="hover:underline">🚪 {t("nav.logout")}</button>
            </div>

            {/* Hamburguesa solo móvil */}
            <button
              onClick={() => setOpen(true)}
              className="p-2 md:hidden"
              aria-label={t("nav.openMenu")}
            >
              ☰
            </button>
          </nav>
        </div>
      </header>

      {/* Slide-over menú móvil */}
      <div className={`${open ? "fixed" : "hidden"} inset-0 z-50 md:hidden`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <aside className="absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white text-gray-900 shadow-xl p-4 flex flex-col gap-2">
          <button onClick={() => setOpen(false)} className="self-end p-2" aria-label={t("nav.closeMenu")}>✕</button>
          <Link to="/dashboard" className="py-2 border-b">🏠 {t("nav.home")}</Link>
          <Link to="/trips" className="py-2 border-b">✈️ {t("nav.trips")}</Link>
          <Link to="/transactions" className="py-2 border-b">💰 {t("nav.transactions")}</Link>
          <Link to="/transactions/new" className="py-2 border-b">➕ {t("nav.newTransaction")}</Link>
          <Link to="/statistics" className="py-2 border-b">📊 {t("nav.statistics")}</Link>
          <Link to="/budgets" className="py-2 border-b">🧾 {t("nav.budgets")}</Link>
          <Link to="/comparison" className="py-2 border-b">🌍 {t("nav.comparison")}</Link>
          <Link to="/profile" className="py-2">👤 {t("nav.profile")}</Link>
          <button onClick={handleLogout} className="mt-2 text-left text-red-600">🚪 {t("nav.logout")}</button>
        </aside>
      </div>
    </>
  );
}
