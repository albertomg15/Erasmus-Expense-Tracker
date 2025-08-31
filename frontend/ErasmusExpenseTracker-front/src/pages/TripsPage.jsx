import { useEffect, useMemo, useState } from "react";
import { getTripsByUserId } from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function TripsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 3x3 por pantalla
  const { t } = useTranslation("trips");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = parseJwt(token).userId;
        const data = await getTripsByUserId(userId);
        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading trips", err);
        toast.error(t("loadError", { defaultValue: "Failed to load trips" }));
      }
    };
    if (token) fetchTrips();
  }, [token, t]);

  // Cálculos de paginación
  const totalItems = trips.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Si cambian los datos o el pageSize, reajusta page si se quedó “fuera de rango”
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return trips.slice(start, end);
  }, [trips, page, pageSize]);

  const fromItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t("yourTrips", { defaultValue: "Your trips" })}</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">
            {t("itemsPerPage", { defaultValue: "Items per page" })}
          </label>
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[6, 9, 12, 15, 24].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button
            onClick={() => navigate("/trips/new")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {t("newTrip", { defaultValue: "New Trip" })}
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="text-gray-600">{t("noTripsYet", { defaultValue: "No trips yet." })}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageSlice.map((trip) => (
              <div
                key={trip.tripId}
                onClick={() => navigate(`/trips/${trip.tripId}`)}
                className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold">{trip.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </p>
                {trip.destination && (
                  <p className="text-sm text-gray-600 mt-2 italic">{trip.destination}</p>
                )}
              </div>
            ))}
          </div>

          {/* Footer paginación */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6">
            <div className="text-sm text-gray-600">
              {t("showingRange", {
                defaultValue: "Showing {{from}}–{{to}} of {{total}}",
                from: fromItem,
                to: toItem,
                total: totalItems,
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              t={t}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange, t }) {
  if (totalPages <= 1) return null;

  const go = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

  // Paginación con ventana corta (máx. 5 botones)
  const pages = [];
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={page === 1}
      >
        ← {t("prev", { defaultValue: "Previous" })}
      </button>

      {start > 1 && (
        <>
          <PageBtn n={1} active={page === 1} onClick={() => go(1)} />
          <span className="px-2 select-none">…</span>
        </>
      )}

      {pages.map((n) => (
        <PageBtn key={n} n={n} active={page === n} onClick={() => go(n)} />
      ))}

      {end < totalPages && (
        <>
          <span className="px-2 select-none">…</span>
          <PageBtn n={totalPages} active={page === totalPages} onClick={() => go(totalPages)} />
        </>
      )}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
      >
        {t("next", { defaultValue: "Next" })} →
      </button>
    </div>
  );
}

function PageBtn({ n, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border ${active ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-100"}`}
    >
      {n}
    </button>
  );
}

function parseJwt(token) {
  if (!token) return {};
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return {};
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
