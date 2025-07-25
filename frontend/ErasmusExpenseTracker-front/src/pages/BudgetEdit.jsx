import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateBudget, getBudgetById } from "../services/budgetService";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // Ajusta la ruta si es diferente


export default function BudgetEdit() {
  const { t } = useTranslation("budget");
  const { budgetId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: "",
    year: "",
    maxSpending: "",
    warningThreshold: "",
  });

  useEffect(() => {
    async function fetchBudget() {
      try {
        const budget = await getBudgetById(budgetId);
        setForm({
          month: budget.month,
          year: budget.year,
          maxSpending: budget.maxSpending,
          warningThreshold: budget.warningThreshold,
        });
      } catch (err) {
        console.error("Error loading budget:", err);
        toast.error(t("loadError"));
        navigate("/budgets");
      }
    }
    fetchBudget();
  }, [budgetId, navigate, t]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const maxSpendingNum = parseFloat(form.maxSpending);
    const warningThresholdNum = parseFloat(form.warningThreshold);
    const monthNum = parseInt(form.month);
    const yearNum = parseInt(form.year);

    if (!monthNum || !yearNum) return toast.error(t("validation.required"));
    if (isNaN(maxSpendingNum) || isNaN(warningThresholdNum))
      return toast.error(t("validation.invalidNumbers"));
    if (maxSpendingNum <= warningThresholdNum)
      return toast.error(t("validation.threshold"));

    try {
      await updateBudget({
        budgetId,
        ...form,
        maxSpending: maxSpendingNum,
        warningThreshold: warningThresholdNum,
      });
      toast.success(t("updatedSuccess"));
      navigate("/budgets");
    } catch (err) {
      console.error(err);
      toast.error(t("updateError"));
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("editTitle")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">{t("month")}</label>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString(i18n.language, { month: "long" })}
              </option>
            ))}

          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("year")}</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {t("maxSpending")}
            <span className="ml-1 cursor-help text-blue-600" title={t("tooltipMax")}>ℹ️</span>
          </label>
          <input
            type="number"
            name="maxSpending"
            value={form.maxSpending}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {t("warningThreshold")}
            <span className="ml-1 cursor-help text-yellow-600" title={t("tooltipWarning")}>ℹ️</span>
          </label>
          <input
            type="number"
            name="warningThreshold"
            value={form.warningThreshold}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            {t("update")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/budgets")}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
