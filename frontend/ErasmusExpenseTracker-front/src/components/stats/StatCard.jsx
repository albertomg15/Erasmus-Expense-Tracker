import React from "react";
import { useTranslation } from "react-i18next";

const StatCard = ({ title, value, color }) => {
  const { t } = useTranslation("statistics");

  const colorMap = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    default: "text-gray-800",
  };

  return (
    <div className="bg-white shadow rounded-2xl p-4 text-center">
      <h3 className="text-sm font-medium text-gray-500 mb-1">
        {t(`stat.${title.toLowerCase()}`)}
      </h3>
      <p className={`text-xl font-semibold ${colorMap[color] || colorMap.default}`}>
        €{value.toFixed(2)}
      </p>
    </div>
  );
};

export default StatCard;
