import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 backdrop-blur border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 h-12">
        <li>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center text-xs ${pathname.startsWith("/dashboard") ? "font-semibold" : ""}`}
            aria-label={t("nav.home")}
          >
            🏠 <span>{t("nav.home")}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/transactions"
            className={`flex flex-col items-center justify-center text-xs ${pathname.startsWith("/transactions") ? "font-semibold" : ""}`}
            aria-label={t("nav.transactions")}
          >
            💰 <span>{t("nav.transactions")}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/transactions/new"
            className={`flex flex-col items-center justify-center text-xs ${pathname === "/transactions/new" ? "font-semibold" : ""}`}
            aria-label={t("nav.newTransaction")}
          >
            ➕ <span>{t("nav.newTransaction")}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/statistics"
            className={`flex flex-col items-center justify-center text-xs ${pathname.startsWith("/statistics") ? "font-semibold" : ""}`}
            aria-label={t("nav.statistics")}
          >
            📊 <span>{t("nav.statistics")}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
