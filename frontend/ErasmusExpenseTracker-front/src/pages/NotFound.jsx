import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-screen bg-[#E6F0FA] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-bold text-[#0056B3] mb-4">{t("notFound.title")}</h1>
      <p className="text-xl text-gray-700 mb-6">{t("notFound.message")}</p>
      <Link
        to="/"
        className="bg-[#0056B3] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
