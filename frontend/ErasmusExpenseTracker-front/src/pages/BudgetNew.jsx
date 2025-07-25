import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrUpdateMonthlyBudget } from "../services/budgetService";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // Ajusta la ruta si es diferente


export default function BudgetNew() {
  const { t } = useTranslation("budget");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    maxSpending: "",
    warningThreshold: "",
  });

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
      await createOrUpdateMonthlyBudget({
        ...form,
        maxSpending: maxSpendingNum,
        warningThreshold: warningThresholdNum,
      });

      toast.success(t("createdSuccess"));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(t("createError"));
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("newTitle")}</h1>
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {t("save")}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
