import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import { getDashboardData } from "../services/transactionService";


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
        availableBudget: data.availableBudget
      });

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [token]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-xl p-4">
          <h2 className="text-lg font-semibold">Current Balance</h2>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h2 className="text-lg font-semibold">Spent this month</h2>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-2">
  <h2 className="text-lg font-semibold">Monthly Limit</h2>

  {budget && budget.maxSpending ? (
    <>
      <p className="text-2xl font-bold text-blue-600">
        {formatCurrency(budget.maxSpending)}
      </p>
      <p className="text-sm text-gray-600">
        {formatCurrency(budget.availableBudget)} left this month
      </p>

      {/* Barra de progreso */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className={`
            h-full rounded-full transition-all duration-300
            ${getBudgetBarColor(budget)}
          `}
          style={{
            width: `${getUsedPercentage(budget)}%`,
          }}
        />
        </div>
      </>
      ) : (
      <p className="text-2xl font-bold text-blue-600">-</p>
    )}

      <button
        onClick={() => navigate("/budgets/new")}
        className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded self-start"
      >
        Set Monthly Budget
      </button>
      </div>

        </div>

  

      {/* ÚLTIMAS TRANSACCIONES */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Latest Transactions</h2>
          <button
            onClick={() => navigate("/transactions/new")}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            ➕ Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <p>No transactions found for this month.</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const amountFormatted = `${isIncome ? "+" : "-"}${formatCurrency(tx.amount)}`;
              const amountClass = isIncome ? "text-green-600" : "text-red-600";
              const categoryName = tx.category?.emoji
                ? `${tx.category.emoji} ${tx.category.name}`
                : tx.category?.name || "Uncategorized";
              const dateFormatted = new Date(tx.date).toLocaleDateString();

              return (
                <li key={tx.transactionId} className="py-3 flex justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium">{tx.description}</span>
                    <span className="text-sm text-gray-500">({categoryName})</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${amountClass}`}>{amountFormatted}</div>
                    <div className="text-xs text-gray-500">{dateFormatted}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex justify-start pt-4">
        <button
          onClick={() => navigate("/transactions")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
        📋 View all transactions
        </button>
      </div>
    </div>
  );
}
