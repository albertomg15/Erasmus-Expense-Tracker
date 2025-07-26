import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const MonthlyEvolutionChart = ({ data, currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="w-full h-[320px] bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">
        {t("tabs.evolution")}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#10B981" name={t("labels.income")} />
          <Line type="monotone" dataKey="expense" stroke="#EF4444" name={t("labels.expense")} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyEvolutionChart;
