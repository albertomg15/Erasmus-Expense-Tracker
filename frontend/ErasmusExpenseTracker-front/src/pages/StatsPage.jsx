import React, { useEffect, useState } from "react";
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
  const now = new Date();
  const { userId } = parseJwt(token);
  const { t, i18n } = useTranslation("statistics");

  const [activeTab, setActiveTab] = useState("summary");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [tripSpending, setTripSpending] = useState([]);
  const [annualSummary, setAnnualSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const TABS = [
    { key: "summary", label: t("tabs.summary") },
    { key: "evolution", label: t("tabs.evolution") },
    { key: "categories", label: t("tabs.categories") },
    { key: "incomeVsExpense", label: t("tabs.incomeVsExpense") },
    { key: "monthlyComparison", label: t("tabs.monthlyComparison") },
    { key: "tripSpending", label: t("tabs.tripSpending") },
    { key: "annualSummary", label: t("tabs.annualSummary") },
  ];

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
          {
            label: t("labels.income"),
            income: parseFloat(incomeExpenseData.totalIncome),
            expense: 0,
          },
          {
            label: t("labels.expense"),
            income: 0,
            expense: parseFloat(incomeExpenseData.totalExpense),
          },
        ]);

        setMonthlyComparison(
          monthlyCompData.map((entry) => ({
            month: `${new Date(entry.year, entry.month - 1).toLocaleString(i18n.language, {
              month: "short",
            })} ${entry.year}`,
            income: parseFloat(entry.totalIncome),
            expense: parseFloat(entry.totalExpense),
            savings: parseFloat(entry.totalIncome) - parseFloat(entry.totalExpense),
          }))
        );

        setTripSpending(
          tripSpendingData.map((trip) => ({
            tripName: trip.name,
            total: parseFloat(trip.totalSpent),
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
  }, [token, selectedMonth, selectedYear, i18n.language]);

  if (loading) return <div className="p-6">{t("loading")}</div>;
  if (!summary) return <div className="p-6 text-red-500">{t("errorLoading")}</div>;

  const renderMonthYearFilter = () => (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <label className="text-sm font-medium">
        {t("filters.month")}:
        <select
          className="ml-2 border rounded px-2 py-1"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString(i18n.language, { month: "long" })}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium">
        {t("filters.year")}:
        <select
          className="ml-2 border rounded px-2 py-1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = now.getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(["summary", "categories", "incomeVsExpense"].includes(activeTab)) &&
        renderMonthYearFilter()}

      {/* Tab Content */}
      {activeTab === "summary" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard title="income" value={summary.totalIncome} color="green" />
            <StatCard title="expense" value={summary.totalExpense} color="red" />
            <StatCard title="balance" value={summary.balance} color="blue" />

          </div>

          {summary.monthlyBudget && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{t("budgetUsage")}</h2>
              <BudgetRing
                percent={summary.budgetUsedPercent}
                used={summary.totalExpense}
                max={summary.monthlyBudget}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "evolution" && <MonthlyEvolutionChart data={evolution} />}
      {activeTab === "categories" && (
        <>
          <h2 className="text-xl font-semibold mb-2">{t("expensesByCategory")}</h2>
          {summary.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 ? (
            <CategoryPieChart data={summary.expensesByCategory} />
          ) : (
            <p className="text-gray-500">{t("noCategoryData")}</p>
          )}
        </>
      )}
      {activeTab === "incomeVsExpense" && <IncomeVsExpenseChart data={incomeVsExpense} />}
      {activeTab === "monthlyComparison" && <MonthlyComparisonChart data={monthlyComparison} />}
      {activeTab === "tripSpending" && <TripSpendingChart data={tripSpending} />}
      {activeTab === "annualSummary" && <AnnualSummaryChart data={annualSummary} />}
    </div>
  );
};

export default StatsPage;
