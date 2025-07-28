import { useEffect, useState } from "react";
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

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const loadData = async () => {
    try {
      const data = await fetchCountryComparison(month, year);
      setComparisons(data.comparisons);
      setIncompleteData(data.incompleteData);
      setError(null);
    } catch (err) {
      if (err.message === "consent_required") {
        setError(t("consentRequired"));
      } else {
        setError(t("loadError"));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currency = comparisons.length > 0 ? comparisons[0].currency : null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      <div className="mb-4 flex items-center space-x-4">
        <label>
          {t("selectMonth")}:
          <select
            value={month}
            onChange={handleMonthChange}
            className="ml-2 px-2 py-1 border rounded"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {t(`months.${m}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("selectYear")}:
          <select
            value={year}
            onChange={handleYearChange}
            className="ml-2 px-2 py-1 border rounded"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="text-red-500 font-medium">{error}</p>
      ) : (
        <>
          <p className="text-yellow-600 font-medium mb-4">
            {t("incompleteNotice")}
          </p>

          <Card>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="userAverage"
                    name={t("user")}
                    fill="#8884d8"
                  />
                  <Bar
                    dataKey="countryAverage"
                    name={t("country")}
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
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
