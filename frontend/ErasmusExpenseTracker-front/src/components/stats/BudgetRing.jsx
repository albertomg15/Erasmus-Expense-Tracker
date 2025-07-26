import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters"; // ajusta ruta si es necesario

const BudgetRing = ({ percent, used, max, currency }) => {
  const { t } = useTranslation("statistics");

  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-gray-700 text-base font-semibold"
        >
          {percent.toFixed(0)}%
        </text>
      </svg>

      <p className="text-sm text-gray-600 mt-2">
        {t("budget.used")} {formatCurrency(used, currency)} / {t("budget.total")} {formatCurrency(max, currency)}
      </p>
    </div>
  );
};

export default BudgetRing;
