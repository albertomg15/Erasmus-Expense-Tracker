import { useTranslation } from "react-i18next";
import FilteredTransactionList from "../components/FilteredTransactionList";

export default function TransactionsPage() {
  const { t } = useTranslation("transactions");

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("allTitle")}</h1>
        <button
          onClick={() => (window.location.href = "/transactions/new")}
          className="hidden md:inline-flex bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          ➕ {t("addTransaction")}
        </button>
      </div>

      <FilteredTransactionList />
    </div>
  );
}
