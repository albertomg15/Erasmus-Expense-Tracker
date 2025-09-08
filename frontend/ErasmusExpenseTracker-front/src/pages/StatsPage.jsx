import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { parseJwt } from "../utils/tokenUtils";
import { useTranslation } from "react-i18next";
import {
  getMonthlySummary,
  getMonthlyEvolution,
  getIncomeVsExpense,
  getMonthlyComparison,
  getTripSpending,
  getAnnualSummary,
} from "../services/statsService";

import StatCard from "../components/stats/StatCard";
import BudgetRing from "../components/stats/BudgetRing";
import CategoryPieChart from "../components/stats/CategoryPieChart";
import MonthlyEvolutionChart from "../components/stats/MonthlyEvolutionChart";
import IncomeVsExpenseChart from "../components/stats/IncomeVsExpenseChart";
import MonthlyComparisonChart from "../components/stats/MonthlyComparisonChart";
import TripSpendingChart from "../components/stats/TripSpendingChart";
import AnnualSummaryChart from "../components/stats/AnnualSummaryChart";

const StatsPage = () => {
  const { token } = useAuth();
  const { t, i18n } = useTranslation("statistics");
  const now = new Date();
  const { userId } = parseJwt(token);

  const [activeTab, setActiveTab] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [tripSpending, setTripSpending] = useState([]);
  const [annualSummary, setAnnualSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const TABS = useMemo(
    () => [
      { key: "summary", label: t("tabs.summary") },
      { key: "evolution", label: t("tabs.evolution") },
      { key: "categories", label: t("tabs.categories") },
      { key: "incomeVsExpense", label: t("tabs.incomeVsExpense") },
      { key: "monthlyComparison", label: t("tabs.monthlyComparison") },
      { key: "tripSpending", label: t("tabs.tripSpending") },
      { key: "annualSummary", label: t("tabs.annualSummary") },
    ],
    [t]
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!userId) return;
        setLoading(true);

        const [
          summaryData,
          evolutionData,
          incomeExpenseData,
          monthlyCompData,
          tripSpendingData,
          annualSummaryData,
        ] = await Promise.all([
          getMonthlySummary(userId, selectedMonth, selectedYear),
          getMonthlyEvolution(userId, 6),
          getIncomeVsExpense(userId, selectedMonth, selectedYear),
          getMonthlyComparison(userId),
          getTripSpending(userId),
          getAnnualSummary(userId, selectedYear),
        ]);

        setSummary(summaryData);
        setEvolution(evolutionData);

        setIncomeVsExpense([
          { label: t("labels.income"), income: Number(incomeExpenseData.totalIncome) || 0, expense: 0 },
          { label: t("labels.expense"), income: 0, expense: Number(incomeExpenseData.totalExpense) || 0 },
        ]);

        setMonthlyComparison(
          (monthlyCompData || []).map((entry) => ({
            month: `${new Date(entry.year, entry.month - 1).toLocaleString(i18n.language, { month: "short" })} ${entry.year}`,
            income: Number(entry.totalIncome) || 0,
            expense: Number(entry.totalExpense) || 0,
            savings: (Number(entry.totalIncome) || 0) - (Number(entry.totalExpense) || 0),
          }))
        );

        setTripSpending(
          (tripSpendingData || []).map((trip) => ({
            tripName: trip.name,
            total: Number(trip.totalSpent) || 0,
          }))
        );

        setAnnualSummary(annualSummaryData);
      } catch (error) {
        console.error("Error loading statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token, userId, selectedMonth, selectedYear, i18n.language, t]);

  if (loading) return <div>{t("loading")}</div>;
  if (!summary) return <div className="text-red-500">{t("errorLoading")}</div>;

  const monthsOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString(i18n.language, { month: "long" }),
  }));
  const yearsOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const showMonthYear = ["summary", "categories", "incomeVsExpense"].includes(activeTab);

  const Filters = ({ compact = false }) => (
    <div className={compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 sm:grid-cols-3 gap-2"}>
      <label className="text-sm">
        {t("filters.month")}
        <select
          className="mt-1 w-full border rounded px-2 py-1"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {monthsOptions.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        {t("filters.year")}
        <select
          className="mt-1 w-full border rounded px-2 py-1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {yearsOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>

      <button
        onClick={() => setFiltersOpen(false)}
        className="sm:col-span-1 px-3 py-2 rounded border bg-white hover:bg-gray-50"
      >
        {t("apply")}
      </button>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Tabs horizontales scrollables en móvil */}
      <div className="-mx-3 sm:mx-0 overflow-x-auto">
        <div className="flex gap-4 border-b px-3 sm:px-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 whitespace-nowrap font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros: botón móvil + inline desktop */}
      {showMonthYear && (
        <>
          <div className="flex items-center justify-between">
            <button
              className="md:hidden px-3 py-2 border rounded"
              onClick={() => setFiltersOpen(true)}
            >
              {t("filters.title", { defaultValue: "Filters" })}
            </button>
            <div className="hidden md:block w-full">
              <Filters />
            </div>
          </div>

          {/* Drawer móvil */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t("filters.title", { defaultValue: "Filters" })}</h3>
                  <button onClick={() => setFiltersOpen(false)} className="p-2">✕</button>
                </div>
                <Filters compact />
              </aside>
            </div>
          )}
        </>
      )}

      {/* Contenido por pestaña */}
      {activeTab === "summary" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <StatCard title="income" value={summary.totalIncome} color="green" currency={summary.convertedCurrency} />
            <StatCard title="expense" value={summary.totalExpense} color="red" currency={summary.convertedCurrency} />
            <StatCard title="balance" value={summary.balance} color="blue" currency={summary.convertedCurrency} />
          </div>

          {summary.monthlyBudget && (
            <div>
              <h2 className="text-xl font-semibold mb-2">{t("budgetUsage")}</h2>
              <BudgetRing
                percent={summary.budgetUsedPercent}
                used={summary.totalExpense}
                max={summary.monthlyBudget}
                currency={summary.convertedCurrency}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "evolution" && (
        <MonthlyEvolutionChart data={evolution} currency={summary.convertedCurrency} />
      )}

      {activeTab === "categories" && (
        <>
          <h2 className="text-xl font-semibold">{t("expensesByCategory")}</h2>
          {summary.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 ? (
            <CategoryPieChart data={summary.expensesByCategory} currency={summary.convertedCurrency} />
          ) : (
            <p className="text-gray-500">{t("noCategoryData")}</p>
          )}
        </>
      )}

      {activeTab === "incomeVsExpense" && (
        <IncomeVsExpenseChart data={incomeVsExpense} currency={summary.convertedCurrency} />
      )}

      {activeTab === "monthlyComparison" && (
        <MonthlyComparisonChart data={monthlyComparison} currency={summary.convertedCurrency} />
      )}

      {activeTab === "tripSpending" && (
        <TripSpendingChart data={tripSpending} currency={summary.convertedCurrency} />
      )}

      {activeTab === "annualSummary" && <AnnualSummaryChart data={annualSummary} />}

      <p className="text-sm text-gray-500 text-center">
        {t("legend.allValuesInPreferredCurrencyWithCode", { currency: summary.convertedCurrency })}
      </p>
    </div>
  );
};

export default StatsPage;
