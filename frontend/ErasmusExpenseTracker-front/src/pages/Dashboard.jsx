import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency, getCurrencySymbol, formatAmountOnly } from "../utils/formatters";
import { getDashboardData } from "../services/transactionService";
import { useTranslation } from "react-i18next";

function getUsedPercentage(budget) {
  const used = budget.maxSpending - budget.availableBudget;
  const percent = (used / budget.maxSpending) * 100;
  return Math.min(100, Math.max(0, percent));
}
function getBudgetBarColor(budget) {
  const percent = getUsedPercentage(budget);
  if (percent < 60) return "bg-green-500";
  if (percent < 90) return "bg-yellow-500";
  return "bg-red-500";
}

export default function Dashboard() {
  const { t } = useTranslation("dashboard");
  const { token } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDashboardData();
        setBalance(data.balance);
        setMonthlyExpenses(data.currentMonthExpenses);
        setTransactions(data.recentTransactions || []);
        setBudget({
          maxSpending: data.maxSpending,
          availableBudget: data.availableBudget,
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) return <p className="p-4">{t("loading")}</p>;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* SUMMARY */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white shadow-sm rounded-xl p-4">
          <h2 className="text-lg font-semibold">{t("currentBalance")}</h2>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-4">
          <h2 className="text-lg font-semibold">{t("spentThisMonth")}</h2>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-4 flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t("monthlyLimit")}</h2>

          {budget && budget.maxSpending ? (
            <>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budget.maxSpending)}
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(budget.availableBudget)} {t("leftThisMonth")}
              </p>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1"
                   role="progressbar"
                   aria-valuenow={Math.round(getUsedPercentage(budget))}
                   aria-valuemin={0}
                   aria-valuemax={100}
                   aria-label={t("monthlyLimit")}>
                <div
                  className={`h-full rounded-full ${getBudgetBarColor(budget)}`}
                  style={{ width: `${getUsedPercentage(budget)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-2xl font-bold text-blue-600">-</p>
          )}

          <button
            onClick={() => navigate("/budgets/new")}
            className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            {t("setBudget")}
          </button>
        </div>
      </section>

      {/* LATEST TRANSACTIONS */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-xl font-semibold">{t("latestTransactions")}</h2>
          {/* Oculto en móvil. En móvil ya tienes acceso rápido desde la bottom-nav */}
          <button
            onClick={() => navigate("/transactions/new")}
            className="hidden md:inline-flex bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            ➕ {t("addTransaction")}
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-600">{t("noTransactions")}</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const sign = isIncome ? "+" : "-";
              const originalAmount = `${sign}${formatAmountOnly(tx.amount)} ${getCurrencySymbol(tx.currency)}`;
              const convertedAmount = `${sign}${formatAmountOnly(tx.convertedAmount)} ${getCurrencySymbol(tx.convertedCurrency)}`;
              const amountClass = isIncome ? "text-green-600" : "text-red-600";
              const categoryName = tx.categoryEmoji
                ? `${tx.categoryEmoji} ${tx.categoryName || t("uncategorized")}`
                : tx.categoryName || t("uncategorized");
              const dateFormatted = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(tx.date));
              const showConversion = tx.currency !== tx.convertedCurrency;

              return (
                <li key={tx.transactionId} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate max-w-[60vw] sm:max-w-none">{tx.description}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">({categoryName})</span>
                    </div>
                    <div className="text-xs text-gray-500">{dateFormatted}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-semibold ${amountClass}`}>{originalAmount}</div>
                    {showConversion && (
                      <div className="text-xs text-gray-500">≈ {convertedAmount}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4">
          <button
            onClick={() => navigate("/transactions")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            📋 {t("viewAll")}
          </button>
        </div>
      </section>
    </div>
  );
}
