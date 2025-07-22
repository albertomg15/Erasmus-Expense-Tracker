import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrUpdateMonthlyBudget } from "../services/budgetService";
import { toast } from "react-hot-toast";

export default function BudgetNew() {
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

    // Validaciones
    if (!monthNum || !yearNum) {
      toast.error("Month and Year are required.");
      return;
    }

    if (isNaN(maxSpendingNum) || isNaN(warningThresholdNum)) {
      toast.error("Both budget values must be valid numbers.");
      return;
    }

    try {
      await createOrUpdateMonthlyBudget({
        ...form,
        maxSpending: maxSpendingNum,
        warningThreshold: warningThresholdNum,
      });

      toast.success("Budget created successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error creating budget.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Monthly Budget</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Month</label>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Year</label>
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
          <label className="block mb-1 font-medium">Max Spending (€)</label>
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
          <label className="block mb-1 font-medium">Warning Threshold (€)</label>
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
            Save Budget
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
