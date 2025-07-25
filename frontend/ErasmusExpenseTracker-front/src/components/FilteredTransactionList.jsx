import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTransactions } from "../services/transactionService";
import { getAllCategoriesByUserId } from "../services/categoryService";
import { getTripsByUserId } from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import { parseJwt } from "../utils/tokenUtils";
import TransactionList from "./TransactionList";

const getMonthLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

export default function FilteredTransactionList() {
  const { t } = useTranslation("transactions");
  const { token } = useAuth();
  const userId = parseJwt(token).userId;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [recurrenceFilter, setRecurrenceFilter] = useState("ALL");
  const [tripFilter, setTripFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchAll() {
      const [txs, cats, trips] = await Promise.all([
        getTransactions(),
        getAllCategoriesByUserId(userId),
        getTripsByUserId(userId),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setTrips(trips);
    }
    if (userId) fetchAll();
  }, [userId]);

  const uniqueMonths = Array.from(
    new Set(transactions.map((tx) => getMonthLabel(tx.date)))
  ).sort((a, b) => new Date(b) - new Date(a));

  const filtered = transactions
    .filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (
        categoryFilter !== "ALL" &&
        tx.category?.name !== categoryFilter &&
        tx.categoryName !== categoryFilter
      )
        return false;
      if (monthFilter !== "ALL" && getMonthLabel(tx.date) !== monthFilter)
        return false;
      if (
        recurrenceFilter !== "ALL" &&
        ((recurrenceFilter === "REGULAR" && tx.recurrencePattern) ||
          (recurrenceFilter === "RECURRING" && !tx.recurrencePattern))
      )
        return false;
      if (tripFilter !== "ALL" && tx.tripId !== tripFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dA = new Date(a.date);
      const dB = new Date(b.date);
      return sortOrder === "DESC" ? dB - dA : dA - dB;
    });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handlePageChange = (delta) => {
    setCurrentPage((prev) => Math.max(1, Math.min(prev + delta, totalPages)));
  };

  return (
    <div>
            {/* Filters */}
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allTypes")}</option>
        <option value="INCOME">{t("income")}</option>
        <option value="EXPENSE">{t("expense")}</option>
      </select>

      <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allMonths")}</option>
        {uniqueMonths.map((month) => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>

      <select value={recurrenceFilter} onChange={(e) => setRecurrenceFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allKinds")}</option>
        <option value="REGULAR">{t("filter.regularOnly")}</option>
        <option value="RECURRING">{t("filter.recurringOnly")}</option>
      </select>

      <select value={tripFilter} onChange={(e) => setTripFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allTrips")}</option>
        {trips.map((trip) => (
          <option key={trip.tripId} value={trip.tripId}>
            {trip.name}
          </option>
        ))}
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 border rounded">
        <option value="DESC">{t("sort.newestFirst")}</option>
        <option value="ASC">{t("sort.oldestFirst")}</option>
      </select>

      

      {/* List */}
      <TransactionList
        transactions={paginated.map((tx) => ({
          ...tx,
          tripName: tx.tripId ? trips.find((t) => t.tripId === tx.tripId)?.name : null,
        }))}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            ← {t("pagination.prev")}
          </button>
            <span className="text-sm mt-1">
              {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
            </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            {t("pagination.next")} →
          </button>
        </div>
      )}
    </div>
  );
}
