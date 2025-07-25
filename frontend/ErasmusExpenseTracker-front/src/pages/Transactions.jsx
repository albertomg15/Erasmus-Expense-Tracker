import { useTranslation } from "react-i18next";
import FilteredTransactionList from "../components/FilteredTransactionList";

export default function TransactionsPage() {
  const { t } = useTranslation("transactions");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("allTitle")}</h1>
        <button
          onClick={() => window.location.href = "/transactions/new"}
          className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap flex items-center gap-2"
        >
          <span className="text-lg">➕</span>
          <span>{t("addTransaction")}</span>
        </button>
      </div>
      <FilteredTransactionList />
    </div>
  );
}
