import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const TripSpendingChart = ({ data, currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">
        {t("tabs.tripSpending")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="tripName" width={120} />
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          <Bar dataKey="total" fill="#6366F1" name={t("labels.totalSpent")} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripSpendingChart;
