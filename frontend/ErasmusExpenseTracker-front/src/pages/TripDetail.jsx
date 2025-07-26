import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripById, getTripTransactions, deleteTrip } from "../services/tripService";
import { formatCurrency } from "../utils/formatters";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
        const [tripData, txs] = await Promise.all([
          getTripById(tripId),
          getTripTransactions(tripId),
        ]);

        // Reconstruir objetos category a partir del JSON plano
        const txsWithCategory = txs.map((tx) => ({
          ...tx,
          category: {
            name: tx.categoryName,
            emoji: tx.categoryEmoji,
          },
        }));


        setTrip(tripData);
        setTransactions(txsWithCategory);
      } catch (err) {
        console.error("Error loading trip or transactions", err);
      }
    }
    fetchTripAndTransactions();
  }, [tripId]);

  if (!trip) return <p>Loading...</p>;

  const totalSpent = transactions
  .filter((tx) => tx.type === "EXPENSE")
  .reduce((sum, tx) => {
    const value = tx.currency === trip.currency ? tx.amount : tx.convertedAmount;
    return sum + value;
  }, 0);


  const pieDataObject = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => {
      const name = tx.category?.name?.trim() || "Uncategorized";
      acc[name] = (acc[name] || 0) + tx.amount;
      return acc;
    }, {});

  const pieChartData = Object.entries(pieDataObject).map(([name, value]) => ({
    name,
    value,
  }));

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(trip.tripId);
        toast.success("Trip deleted successfully.");
        navigate("/trips");
      } catch (err) {
        console.error("Failed to delete trip", err);
        toast.error("Failed to delete trip.");
      }
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#F77E98"];


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{trip.name}</h1>
        <p className="text-gray-600">
          {trip.destination} | {trip.startDate} → {trip.endDate} | {trip.currency}
        </p>
        {trip.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {trip.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => navigate(`/transactions/new?tripId=${trip.tripId}&redirectTo=/trips/${trip.tripId}`)} className="bg-green-600 text-white px-4 py-2 rounded">
            ➕ {t("addTransaction")}
          </button>

          <div className="flex gap-2 mt-3">
            <button onClick={() => navigate(`/trips/edit/${trip.tripId}`)} className="bg-blue-600 text-white px-4 py-2 rounded">
              ✏️ {t("editTrip")}
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
              🗑️ {t("deleteTrip")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{t("transactions")}</h2>
          {transactions.length === 0 ? (
            <p>{t("noTransactionsTrip")}</p>
          ) : (
            <TransactionList transactions={transactions} onDelete={(id) => setTransactions(prev => prev.filter(tx => tx.transactionId !== id))} />
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{t("summary")}</h2>
          <p>
            <strong>{t("totalSpent")}:</strong> {formatCurrency(totalSpent)} / {formatCurrency(trip.estimatedBudget || 0)}
          </p>
          <div className="w-full h-4 bg-gray-200 rounded mt-2 mb-6">
            <div className="h-full bg-red-500 rounded" style={{ width: `${Math.min((totalSpent / (trip.estimatedBudget || 1)) * 100, 100)}%` }} />
          </div>
          <h3 className="font-medium mb-2">{t("breakdown")}</h3>
          {pieChartData.length === 0 ? (
            <p className="text-sm text-gray-500">{t("noExpensesYet")}</p>
          ) : (
            <PieChart width={280} height={280}>
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>
      </div>
    </div>
  );
}

