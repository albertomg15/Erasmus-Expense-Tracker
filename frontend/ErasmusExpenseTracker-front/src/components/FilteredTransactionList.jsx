import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTransactions } from "../services/transactionService";
import { getAllCategoriesByUserId } from "../services/categoryService";
import { getTripsByUserId } from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import { parseJwt } from "../utils/tokenUtils";
import TransactionList from "./TransactionList";

export default function FilteredTransactionList() {
  const { t } = useTranslation("transactions");
  const { token } = useAuth();
  const userId = token ? parseJwt(token).userId : null;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL"); // YYYY-MM
  const [recurrenceFilter, setRecurrenceFilter] = useState("ALL");
  const [tripFilter, setTripFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      const [txs, cats, tripsData] = await Promise.all([
        getTransactions(),
        getAllCategoriesByUserId(userId),
        getTripsByUserId(userId),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setTrips(tripsData);
    }
    if (userId) fetchAll();
  }, [userId]);

  // Reinicia a página 1 al cambiar filtros/orden
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, categoryFilter, monthFilter, recurrenceFilter, tripFilter, sortOrder]);

  // Meses únicos con clave estable YYYY-MM y etiqueta localizable
  const uniqueMonths = useMemo(() => {
    const map = new Map();
    for (const tx of transactions) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) {
        map.set(key, d.toLocaleString(undefined, { month: "long", year: "numeric" }));
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // desc
      .map(([key, label]) => ({ key, label }));
  }, [transactions]);

  const filtered = transactions
    .filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (
        categoryFilter !== "ALL" &&
        tx.category?.name !== categoryFilter &&
        tx.categoryName !== categoryFilter
      ) return false;
      if (monthFilter !== "ALL") {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== monthFilter) return false;
      }
      if (
        recurrenceFilter !== "ALL" &&
        ((recurrenceFilter === "REGULAR" && tx.recurrencePattern) ||
         (recurrenceFilter === "RECURRING" && !tx.recurrencePattern))
      ) return false;
      if (tripFilter !== "ALL" && tx.tripId !== tripFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dA = new Date(a.date);
      const dB = new Date(b.date);
      return sortOrder === "DESC" ? dB - dA : dA - dB;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (delta) => {
    setCurrentPage((p) => Math.max(1, Math.min(p + delta, totalPages)));
  };

  const resetFilters = () => {
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setMonthFilter("ALL");
    setRecurrenceFilter("ALL");
    setTripFilter("ALL");
    setSortOrder("DESC");
  };

  const handleDeleted = (id) => {
    setTransactions((prev) => prev.filter((x) => x.transactionId !== id));
  };

  // UI de filtros
  const FiltersForm = ({ compact = false }) => (
    <div className={compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 lg:grid-cols-6 gap-2"}>
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allTypes")}</option>
        <option value="INCOME">{t("income")}</option>
        <option value="EXPENSE">{t("expense")}</option>
      </select>

      <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allMonths")}</option>
        {uniqueMonths.map((m) => (
          <option key={m.key} value={m.key}>{m.label}</option>
        ))}
      </select>

      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded">
        <option value="ALL">{t("filter.allCategories")}</option>
        {categories.map((cat) => (
          <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
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
          <option key={trip.tripId} value={trip.tripId}>{trip.name}</option>
        ))}
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="p-2 border rounded">
        <option value="DESC">{t("sort.newestFirst")}</option>
        <option value="ASC">{t("sort.oldestFirst")}</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar filtros */}
      <div className="flex items-center justify-between">
        <button
          className="md:hidden px-3 py-2 border rounded"
          onClick={() => setFiltersOpen(true)}
        >
          {t("filters")}
        </button>
        <div className="hidden md:block flex-1">
          <FiltersForm />
        </div>
        <button onClick={resetFilters} className="hidden md:inline-flex px-3 py-2 border rounded ml-2">
          {t("reset")}
        </button>
      </div>

      {/* Slide-over filtros móvil */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("filters")}</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2">✕</button>
            </div>
            <FiltersForm compact />
            <div className="flex gap-2 pt-2">
              <button onClick={resetFilters} className="flex-1 px-3 py-2 border rounded">{t("reset")}</button>
              <button onClick={() => setFiltersOpen(false)} className="flex-1 px-3 py-2 rounded bg-blue-600 text-white">
                {t("apply")}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Lista */}
      <TransactionList
        transactions={paginated.map((tx) => ({
          ...tx,
          tripName: tx.tripId ? trips.find((t) => t.tripId === tx.tripId)?.name : null,
        }))}
        onDelete={handleDeleted}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
          >
            ← {t("pagination.prev")}
          </button>
          <span className="text-sm">{t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}</span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
          >
            {t("pagination.next")} →
          </button>
        </div>
      )}
    </div>
  );
}
