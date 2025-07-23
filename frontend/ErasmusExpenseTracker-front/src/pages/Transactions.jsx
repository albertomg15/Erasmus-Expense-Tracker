import { useEffect, useState } from "react";
import { getTransactions } from "../services/transactionService";
import { getAllCategoriesByUserId } from "../services/categoryService";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import { parseJwt } from "../utils/tokenUtils";
import { deleteTransaction } from "../services/transactionService";
import { deleteRecurringTransaction } from "../services/recurringTransactionService";


const getMonthLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

export default function TransactionsPage() {
  const { token } = useAuth();
  const userId = parseJwt(token).userId;

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Para modal

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [recurrenceFilter, setRecurrenceFilter] = useState("ALL");

  const uniqueMonths = Array.from(
    new Set(transactions.map((tx) => getMonthLabel(tx.date)))
  ).sort((a, b) => new Date(b) - new Date(a));

  useEffect(() => {
    async function fetchData() {
      const data = await getTransactions();
      setTransactions(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const cats = await getAllCategoriesByUserId(userId);
      setCategories(cats);
    }
    if (userId) fetchCategories();
  }, [userId]);

  useEffect(() => {
    let result = [...transactions];

    if (recurrenceFilter === "REGULAR") {
      result = result.filter((tx) => !tx.recurrencePattern);
    } else if (recurrenceFilter === "RECURRING") {
      result = result.filter((tx) => tx.recurrencePattern);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((tx) => tx.category?.categoryId === categoryFilter);
    }

    if (monthFilter !== "ALL") {
      result = result.filter((tx) => getMonthLabel(tx.date) === monthFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
  }, [transactions, typeFilter, categoryFilter, sortOrder, monthFilter, recurrenceFilter]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Transactions</h1>

      {/* FILTROS */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex flex-wrap gap-4">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded">
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
            ))}
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 border rounded">
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>

          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="p-2 border rounded">
            <option value="ALL">All Months</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </option>
            ))}
          </select>

          <select value={recurrenceFilter} onChange={(e) => setRecurrenceFilter(e.target.value)} className="p-2 border rounded">
            <option value="ALL">All Kinds</option>
            <option value="REGULAR">Regular Only</option>
            <option value="RECURRING">Recurring Only</option>
          </select>
        </div>

        <button
          onClick={() => window.location.href = "/transactions/new"}
          className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap flex items-center gap-2"
        >
          <span className="text-lg">➕</span>
          <span>Add Transaction</span>
        </button>
      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="divide-y">
          {filtered.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const isRecurring = !!tx.recurrencePattern;
            const categoryName = tx.category?.emoji
              ? `${tx.category.emoji} ${tx.category.name}`
              : tx.category?.name || "Uncategorized";
            const dateFormatted = new Date(tx.date).toLocaleDateString();

            const amountFormatted = isRecurring
              ? tx.active
                ? `Next charge: ${new Date(tx.nextExecution).toLocaleDateString()}`
                : "Cancelled"
              : `${isIncome ? "+" : "-"}${formatCurrency(tx.amount)}`;
            const amountClass = isRecurring
              ? tx.active
                ? "text-blue-600"
                : "text-red-600"
              : isIncome
                ? "text-green-600"
                : "text-red-600";

            return (
              <li
                key={tx.transactionId}
                onClick={() => setSelectedTransaction(tx)}
                className="py-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer px-2 rounded"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tx.description}</span>
                    {tx.recurrencePattern && (
                      <span title="Recurring" className="text-blue-600 text-sm">🔁</span>
                    )}
                  </div>
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

      {/* MODAL */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Description:</strong> {selectedTransaction.description}</div>
              <div><strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency}</div>
              <div><strong>Type:</strong> {selectedTransaction.type}</div>
              <div><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</div>
              <div><strong>Category:</strong> {selectedTransaction.category?.name || "Uncategorized"}</div>
              {selectedTransaction.recurrencePattern && (
                <>
                  <hr className="my-2" />
                  <div><strong>Recurrence:</strong> {selectedTransaction.recurrencePattern}</div>
                  <div><strong>Next Execution:</strong> {new Date(selectedTransaction.nextExecution).toLocaleDateString()}</div>
                  {selectedTransaction.recurrenceEndDate && (
                    <div><strong>End Date:</strong> {new Date(selectedTransaction.recurrenceEndDate).toLocaleDateString()}</div>
                  )}
                  <div><strong>Occurrences:</strong> {selectedTransaction.executedOccurrences}</div>
                  <div><strong>Status:</strong> {selectedTransaction.active ? "Active" : "Inactive"}</div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  // Ir a pantalla de edición con ID de la transacción
                  window.location.href = `/transactions/edit/${selectedTransaction.transactionId}`;
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit
              </button>
                            <button
                onClick={async () => {
                  const confirmed = window.confirm("Are you sure you want to delete this transaction?");
                  if (!confirmed) return;

                  try {
                    if (selectedTransaction.recurrencePattern) {
                      await deleteRecurringTransaction(selectedTransaction.transactionId);
                    } else {
                      await deleteTransaction(selectedTransaction.transactionId);
                    }
                    setTransactions((prev) =>
                      prev.filter((tx) => tx.transactionId !== selectedTransaction.transactionId)
                    );
                    setSelectedTransaction(null);
                  } catch (error) {
                    console.error("Failed to delete transaction:", error);
                    alert("Error deleting transaction.");
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
