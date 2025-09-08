import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripById, getTripTransactions, deleteTrip } from "../services/tripService";
import { formatCurrency } from "../utils/formatters";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "react-hot-toast";
import TransactionList from "../components/TransactionList";
import { useTranslation } from "react-i18next";

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { t } = useTranslation("trips");

  useEffect(() => {
    async function fetchTripAndTransactions() {
      try {
        const [tripData, txs] = await Promise.all([getTripById(tripId), getTripTransactions(tripId)]);
        const txsWithCategory = txs.map((tx) => ({
          ...tx,
          category: { name: tx.categoryName, emoji: tx.categoryEmoji },
        }));
        setTrip(tripData);
        setTransactions(txsWithCategory);
      } catch (err) {
        console.error("Error loading trip or transactions", err);
      }
    }
    fetchTripAndTransactions();
  }, [tripId]);

  if (!trip) return <p>{t("loading", { defaultValue: "Loading..." })}</p>;

  const totalSpent = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + (tx.currency === trip.currency ? tx.amount : tx.convertedAmount), 0);

  const pieDataObj = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => {
      const name = tx.category?.name?.trim() || t("uncategorized", { defaultValue: "Uncategorized" });
      acc[name] = (acc[name] || 0) + (tx.currency === trip.currency ? tx.amount : tx.convertedAmount);
      return acc;
    }, {});
  const pieChartData = Object.entries(pieDataObj).map(([name, value]) => ({ name, value }));

  const handleDelete = async () => {
    if (!confirm(t("confirmDeleteTrip", { defaultValue: "Delete this trip?" }))) return;
    try {
      await deleteTrip(trip.tripId);
      toast.success(t("deleted", { defaultValue: "Trip deleted" }));
      navigate("/trips");
    } catch {
      toast.error(t("deleteFailed", { defaultValue: "Failed to delete trip" }));
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#F77E98", "#82ca9d", "#a4de6c"];

  const budgetPct = trip.estimatedBudget ? Math.min((totalSpent / trip.estimatedBudget) * 100, 100) : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-2">
        <h1 className="text-2xl font-bold truncate">{trip.name}</h1>
        <p className="text-gray-600">
          {trip.destination} | {formatDate(trip.startDate)} → {formatDate(trip.endDate)} | {trip.currency}
        </p>

        {trip.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {trip.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate(`/transactions/new?tripId=${trip.tripId}&redirectTo=/trips/${trip.tripId}`)}
            className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            ➕ {t("addTransaction")}
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/trips/edit/${trip.tripId}`)} className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
              ✏️ {t("editTrip")}
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto">
              🗑️ {t("deleteTrip")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        <section className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-3">{t("transactions")}</h2>
          {transactions.length === 0 ? (
            <p>{t("noTransactionsTrip")}</p>
          ) : (
            <TransactionList
              transactions={transactions}
              onDelete={(id) => setTransactions((prev) => prev.filter((tx) => tx.transactionId !== id))}
            />
          )}
        </section>

        <aside className="bg-white p-4 rounded-xl shadow space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{t("summary")}</h2>
            <p>
              <strong>{t("totalSpent")}:</strong> {formatCurrency(totalSpent)}{" "}
              {trip.estimatedBudget ? ` / ${formatCurrency(trip.estimatedBudget)}` : ""}
            </p>
            <div className="w-full h-3 bg-gray-200 rounded mt-2" role="progressbar"
                 aria-valuenow={Math.round(budgetPct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-red-500 rounded" style={{ width: `${budgetPct}%` }} />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">{t("breakdown")}</h3>
            {pieChartData.length === 0 ? (
              <p className="text-sm text-gray-500">{t("noExpensesYet")}</p>
            ) : (
              <div className="w-full aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" outerRadius="75%" label>
                      {pieChartData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatDate(s) {
  return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
