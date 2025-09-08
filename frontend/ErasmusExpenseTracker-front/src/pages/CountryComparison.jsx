import { useEffect, useMemo, useState } from "react";
import { fetchCountryComparison } from "../services/countryComparisonService";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "../components/card";

export default function CountryComparison() {
  const { t } = useTranslation("comparison");
  const [comparisons, setComparisons] = useState([]);
  const [incompleteData, setIncompleteData] = useState(false);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const years = useMemo(() => [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1], [now]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const loadData = async () => {
    try {
      const data = await fetchCountryComparison(month, year);
      setComparisons(data.comparisons || []);
      setIncompleteData(Boolean(data.incompleteData));
      setError(null);
    } catch (err) {
      setError(err?.message === "consent_required" ? t("consentRequired") : t("loadError"));
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const currency = comparisons.length > 0 ? comparisons[0].currency : null;

  const Filters = ({ compact = false }) => (
    <div className={compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 md:grid-cols-4 gap-2"}>
      <label className="text-sm text-gray-700">
        {t("selectMonth")}
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="mt-1 w-full px-2 py-1 border rounded"
        >
          {months.map((m) => (
            <option key={m} value={m}>{t(`months.${m}`)}</option>
          ))}
        </select>
      </label>

      <label className="text-sm text-gray-700">
        {t("selectYear")}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="mt-1 w-full px-2 py-1 border rounded"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>

      <button
        onClick={loadData}
        className="md:col-span-2 px-3 py-2 rounded border bg-white hover:bg-gray-50"
      >
        {t("apply")}
      </button>

      <button
        onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }}
        className="md:col-span-1 px-3 py-2 rounded border"
      >
        {t("reset")}
      </button>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          className="md:hidden px-3 py-2 border rounded"
          onClick={() => setFiltersOpen(true)}
        >
          {t("filters")}
        </button>
      </div>

      {/* Filtros desktop */}
      <div className="hidden md:block">
        <Filters />
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
            <Filters compact />
          </aside>
        </div>
      )}

      {error ? (
        <p className="text-red-600 font-medium">{error}</p>
      ) : (
        <>
          {incompleteData && (
            <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
              {t("incompleteNotice")}
            </p>
          )}

          <Card>
            <CardContent>
              <div className="w-full aspect-[4/3] md:aspect-[16/9]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisons}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} height={50} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="userAverage" name={t("user")} fill="#8884d8" />
                    <Bar dataKey="countryAverage" name={t("country")} fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {currency && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  {t("currencyNote", { currency })}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
