import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const colorMap = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  default: "text-gray-800",
};

const StatCard = ({ title, value = 0, color = "default", currency }) => {
  const { t } = useTranslation("statistics");
  const label = t(`stat.${String(title).toLowerCase()}`, { defaultValue: title });

  return (
    <div className="bg-white rounded-2xl shadow p-4 text-center">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className={`text-xl font-semibold ${colorMap[color] || colorMap.default}`}>
        {formatCurrency(Number(value) || 0, currency)}
      </p>
    </div>
  );
};
export default StatCard;
