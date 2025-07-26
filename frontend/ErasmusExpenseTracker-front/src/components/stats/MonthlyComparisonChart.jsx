import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters"; // ajusta la ruta si hace falta

const MonthlyComparisonChart = ({ data, currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">
        {t("tabs.monthlyComparison")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#10B981" name={t("labels.income")} />
          <Line type="monotone" dataKey="expense" stroke="#EF4444" name={t("labels.expense")} />
          <Line type="monotone" dataKey="savings" stroke="#3B82F6" name={t("labels.savings")} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonChart;
