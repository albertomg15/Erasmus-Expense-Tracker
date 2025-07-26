import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters"; // ajusta ruta si hace falta

const IncomeVsExpenseChart = ({ data, currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">
        {t("tabs.incomeVsExpense")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          <Legend />
          <Bar dataKey="income" fill="#10B981" name={t("labels.income")} />
          <Bar dataKey="expense" fill="#EF4444" name={t("labels.expense")} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpenseChart;
