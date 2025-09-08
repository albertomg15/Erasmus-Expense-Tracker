import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const TripSpendingChart = ({ data = [], currency = "EUR" }) => {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{t("tabs.tripSpending")}</h3>
      <div className="w-full aspect-[4/3] md:aspect-[16/9]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <YAxis type="category" dataKey="tripName" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <Bar dataKey="total" fill="#6366F1" name={t("labels.totalSpent")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default TripSpendingChart;
