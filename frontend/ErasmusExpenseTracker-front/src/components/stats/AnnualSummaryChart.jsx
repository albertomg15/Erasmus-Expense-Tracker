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

const AnnualSummaryChart = ({ data }) => {
  const { t } = useTranslation("statistics");

  if (!data || typeof data !== "object") {
    console.warn("AnnualSummaryChart: expected object, got", data);
    return <p className="text-red-500">{t("errors.invalidChartData")}</p>;
  }

  const chartData = [
    {
      month: `${t("labels.year")} ${data.year}`,
      income: parseFloat(data.totalIncome),
      expense: parseFloat(data.totalExpense),
      savings: parseFloat(data.totalSaving),
    },
  ];

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">
        {t("tabs.annualSummary")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#D1FAE5" name={t("labels.income")} />
          <Area type="monotone" dataKey="expense" stackId="1" stroke="#EF4444" fill="#FECACA" name={t("labels.expense")} />
          <Area type="monotone" dataKey="savings" stroke="#3B82F6" fill="#DBEAFE" name={t("labels.savings")} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnnualSummaryChart;
