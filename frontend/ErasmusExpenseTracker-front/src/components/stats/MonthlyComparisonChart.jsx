import React from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const MonthlyComparisonChart = ({ data = [], currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{t("tabs.monthlyComparison")}</h3>
      <div className="w-full aspect-[4/3] md:aspect-[16/9]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={0} angle={-15} height={40} />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <Tooltip formatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10B981" name={t("labels.income")} />
            <Line type="monotone" dataKey="expense" stroke="#EF4444" name={t("labels.expense")} />
            <Line type="monotone" dataKey="savings" stroke="#3B82F6" name={t("labels.savings")} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default MonthlyComparisonChart;
