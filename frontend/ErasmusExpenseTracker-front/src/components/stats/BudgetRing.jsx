import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatters";

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

const BudgetRing = ({ percent, used, max, currency, size = 140 }) => {
  const { t } = useTranslation("statistics");
  const gid = useId();

  const p = isFinite(percent) ? clamp(percent, 0, 100) : 0;
  const stroke = Math.max(10, Math.round(size * 0.085));
  const radius = size / 2;
  const r = radius - stroke / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - p / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="auto" role="img" aria-label={t("budget.title")}>
        <defs>
          <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        <circle cx={radius} cy={radius} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={radius}
          cy={radius}
          r={r}
          fill="none"
          stroke={`url(#grad-${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p)}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-gray-700 text-base font-semibold">
          {Math.round(p)}%
        </text>
      </svg>

      <p className="text-sm text-gray-600 mt-2 text-center">
        {t("budget.used")} {formatCurrency(used || 0, currency)} / {t("budget.total")} {formatCurrency(max || 0, currency)}
      </p>
    </div>
  );
};

export default BudgetRing;
