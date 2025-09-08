import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const AnnualSummaryChart = ({ data }) => {
  const { t } = useTranslation("statistics");

  if (!data || typeof data !== "object") {
    console.warn("AnnualSummaryChart: expected object, got", data);
    return <p className="text-red-500">{t("errors.invalidChartData")}</p>;
  }

  const currency = data.convertedCurrency || "EUR";
  const chartData = [
    {
      label: `${t("labels.year")} ${data.year}`,
      income: Number(data.totalIncome) || 0,
      expense: Number(data.totalExpense) || 0,
      savings: Number(data.totalSaving) || 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{t("tabs.annualSummary")}</h3>
      <div className="w-full aspect-[4/3] md:aspect-[16/9]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v) => formatCurrency(v, currency)} />
            <Tooltip formatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <Legend />
            <Area type="monotone" dataKey="income" stackId="sum" stroke="#10B981" fill="#D1FAE5" name={t("labels.income")} />
            <Area type="monotone" dataKey="expense" stackId="sum" stroke="#EF4444" fill="#FECACA" name={t("labels.expense")} />
            <Area type="monotone" dataKey="savings" stroke="#3B82F6" fill="#DBEAFE" name={t("labels.savings")} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnnualSummaryChart;
