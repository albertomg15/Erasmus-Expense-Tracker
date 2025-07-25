import { useEffect, useState } from "react";
import { getBudgetsWithSpent, deleteBudget } from "../services/budgetService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export default function BudgetsPage() {
  const { t } = useTranslation("budget");
  const [budgets, setBudgets] = useState([]);
  const [yearFilter, setYearFilter] = useState("all");
  const [sortBy, setSortBy] = useState("month");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await getBudgetsWithSpent();
      setBudgets(data);
    } catch (err) {
      console.error(err);
      toast.error(t("loadError"));
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("table.confirmDelete"));
    if (!confirmed) return;

    try {
      await deleteBudget(id);
      toast.success(t("deletedSuccess"));
      fetchBudgets();
    } catch (err) {
      console.error(err);
      toast.error(t("deleteError"));
    }
  };

  const filteredBudgets = budgets
    .filter((b) => yearFilter === "all" || b.year === parseInt(yearFilter))
    .sort((a, b) => {
      if (sortBy === "month") return a.year !== b.year ? a.year - b.year : a.month - b.month;
      if (sortBy === "maxSpending") return b.maxSpending - a.maxSpending;
      if (sortBy === "spent") return b.spent - a.spent;
      return 0;
    });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("listTitle")}</h1>
        <Link
          to="/budgets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t("addButton")}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div>
          <label className="mr-2 font-medium">{t("filterYear")}</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">{t("allYears")}</option>
            {[...new Set(budgets.map((b) => b.year))].sort().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

        </div>
        <div>
          <label className="mr-2 font-medium">{t("sortBy")}</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="month">{t("sort.month")}</option>
            <option value="maxSpending">{t("sort.maxSpending")}</option>
            <option value="spent">{t("sort.spent")}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">{t("table.month")}</th>
              <th className="text-left p-2 border">{t("table.year")}</th>
              <th className="text-left p-2 border">{t("table.max")}</th>
              <th className="text-left p-2 border">{t("table.warning")}</th>
              <th className="text-left p-2 border">{t("table.actions")}</th>
              <th className="text-left p-2 border">{t("table.progress")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBudgets.map((budget) => {
              const progressPercent = Math.min((budget.spent / budget.maxSpending) * 100, 100);
              return (
                <tr key={budget.budgetId} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {new Date(0, budget.month - 1).toLocaleString(i18n.language, {
                      month: "long",
                    })}
                  </td>
                  <td className="p-2 border">{budget.year}</td>
                  <td className="p-2 border">{budget.maxSpending.toFixed(2)}</td>
                  <td className="p-2 border">{budget.warningThreshold.toFixed(2)}</td>
                  <td className="p-2 border whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/budgets/edit/${budget.budgetId}`)}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      {t("table.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(budget.budgetId)}
                      className="text-red-600 hover:underline"
                    >
                      {t("table.delete")}
                    </button>
                  </td>
                  <td className="p-2 border w-64">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          budget.spent >= budget.maxSpending
                            ? "bg-red-500"
                            : budget.spent >= budget.warningThreshold
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-600">
                      {budget.spent.toFixed(2)} € / {budget.maxSpending.toFixed(2)} €
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
