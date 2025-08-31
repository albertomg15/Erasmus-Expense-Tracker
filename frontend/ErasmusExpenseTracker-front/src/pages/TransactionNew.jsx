import { useEffect, useState } from "react";
import { createTransaction, createRecurringTransaction } from "../services/transactionService";
import { getTripsByUserId } from "../services/tripService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAllCategoriesByUserId } from "../services/categoryService";
import CategorySelector from "../components/CategorySelector";
import { useTranslation } from "react-i18next";
import { parseJwt } from "../utils/tokenUtils";
import { getSupportedCurrencies } from "../services/exchangeRateService";

// --- Helpers para el cálculo de ejecuciones pendientes (catch-up) ---
const toLocalDate = (dStr) => {
  const d = new Date(dStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addStep = (date, pattern) => {
  const d = new Date(date);
  switch (pattern) {
    case "DAILY":
      d.setDate(d.getDate() + 1);
      break;
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1);
      break;
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setDate(d.getDate() + 1);
  }
  return d;
};

const computePending = (nextExecutionStr, pattern) => {
  if (!nextExecutionStr) return { count: 0 };
  let next = toLocalDate(nextExecutionStr);
  const today = toLocalDate(new Date().toISOString().split("T")[0]);

  if (next > today) return { count: 0 };

  let count = 0;
  const first = new Date(next);
  let last = null;

  while (next <= today) {
    count++;
    last = new Date(next);
    next = addStep(next, pattern);
  }
  return { count, first, last };
};

export default function TransactionNew() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTripId = searchParams.get("tripId");
  const redirectTo = searchParams.get("redirectTo");

  const { t } = useTranslation("transactions");

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  const [form, setForm] = useState({
    type: "EXPENSE",
    amount: "",
    currency: "EUR",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    tripId: "",
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFields, setRecurrenceFields] = useState({
    recurrencePattern: "MONTHLY",
    nextExecution: new Date().toISOString().split("T")[0],
    recurrenceEndDate: "",
    maxOccurrences: "",
  });

  // Estado para el modal de catch-up
  const [catchUpPrompt, setCatchUpPrompt] = useState({
    open: false,
    pending: { count: 0 },
    payload: null,
  });

  useEffect(() => {
    async function fetchTripsAndHandlePreselection() {
      try {
        const userId = parseJwt(token).userId;
        const data = await getTripsByUserId(userId);

        if (Array.isArray(data)) {
          setTrips(data);
          if (preselectedTripId && data.some((t) => t.tripId === preselectedTripId)) {
            setForm((prev) => ({ ...prev, tripId: preselectedTripId }));
          }
        } else {
          console.error("Expected array for trips, got:", data);
          setTrips([]);
        }
      } catch (err) {
        console.error("Error loading trips", err);
        setTrips([]);
      }
    }
    if (token) fetchTripsAndHandlePreselection();
  }, [token, preselectedTripId]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const userId = parseJwt(token).userId;
        const data = await getAllCategoriesByUserId(userId);
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    }
    if (token) fetchCategories();
  }, [token]);

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const currencies = await getSupportedCurrencies();
        setAvailableCurrencies(currencies);
      } catch (err) {
        console.error("Error loading currencies", err);
      }
    }
    fetchCurrencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function doCreate(payload, fillPast) {
    setSaving(true);
    try {
      if (isRecurring) {
        await createRecurringTransaction({ ...payload, fillPastOccurrences: !!fillPast });
      } else {
        await createTransaction(payload);
      }
      toast.success(t("createSuccess", { defaultValue: "Transaction created successfully." }));
      if (redirectTo) navigate(redirectTo);
      else navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create transaction", err);
      toast.error(t("createError", { defaultValue: "Error creating transaction." }));
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      toast.error(t("amountPositive", { defaultValue: "Amount must be a positive number." }));
      return;
    }
    if (!form.currency?.trim()) {
      toast.error(t("currencyRequired", { defaultValue: "Currency is required." }));
      return;
    }
    if (!form.category?.trim()) {
      toast.error(t("categoryRequired", { defaultValue: "Category is required." }));
      return;
    }
    if (!form.date) {
      toast.error(t("dateRequired", { defaultValue: "Date is required." }));
      return;
    }

    const transaction = {
      type: form.type,
      amount: parseFloat(form.amount),
      currency: form.currency.toUpperCase(),
      date: form.date,
      description: form.description,
      categoryId: form.category,
      tripId: form.tripId || null,
    };

    let payload = { ...transaction };

    if (isRecurring) {
      payload = {
        ...transaction,
        ...recurrenceFields,
        recurrenceEndDate: recurrenceFields.recurrenceEndDate || null,
        maxOccurrences: recurrenceFields.maxOccurrences
          ? parseInt(recurrenceFields.maxOccurrences)
          : null,
        executedOccurrences: 0,
        active: true,
      };

      // Calcular si hay ejecuciones pendientes entre nextExecution y hoy
      const pending = computePending(recurrenceFields.nextExecution, recurrenceFields.recurrencePattern);
      if (pending.count > 0) {
        setCatchUpPrompt({ open: true, pending, payload });
        return; // detenemos submit hasta que elija Sí/No
      }
    }

    // No recurrente o sin pendientes -> crear directamente
    await doCreate(payload, false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("newTitle")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <div>
          <label className="block mb-1 font-medium">{t("type")}</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="EXPENSE">{t("expense")}</option>
            <option value="INCOME">{t("income")}</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("amount")}</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("currency")}</label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            {availableCurrencies.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>

        <CategorySelector
          categories={categories}
          setCategories={setCategories}
          selectedCategoryId={form.category}
          setSelectedCategoryId={(id) => setForm((prev) => ({ ...prev, category: id }))}
          userId={parseJwt(token).userId}
        />

        <div>
          <label className="block mb-1 font-medium">{t("date")}</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("descriptionOptional")}</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {trips.length > 0 && (
          <div>
            <label className="block mb-1 font-medium">{t("associatedTripOptional")}</label>
            <select
              name="tripId"
              value={form.tripId}
              onChange={handleChange}
              disabled={isRecurring}
              className="w-full p-2 border rounded bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{t("none")}</option>
              {trips.map((trip) => (
                <option key={trip.tripId} value={trip.tripId}>
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsRecurring(checked);
                if (checked) {
                  // si es recurrente, bloqueamos tripId como ya hacías
                  setForm((prev) => ({ ...prev, tripId: "" }));
                }
              }}
            />
            <span>{t("isRecurring")}</span>
            <span className="text-blue-500 cursor-pointer" title={t("recurringHint")}>
              ℹ️
            </span>
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">{t("recurrencePattern")}</label>
              <select
                name="recurrencePattern"
                value={recurrenceFields.recurrencePattern}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({ ...prev, recurrencePattern: e.target.value }))
                }
                className="w-full p-2 border rounded"
              >
                <option value="DAILY">{t("daily")}</option>
                <option value="WEEKLY">{t("weekly")}</option>
                <option value="MONTHLY">{t("monthly")}</option>
                <option value="YEARLY">{t("yearly")}</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("nextExecutionDate")}</label>
              <input
                type="date"
                name="nextExecution"
                value={recurrenceFields.nextExecution}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({ ...prev, nextExecution: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("recurrenceEndDateOptional")}</label>
              <input
                type="date"
                name="recurrenceEndDate"
                value={recurrenceFields.recurrenceEndDate}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({ ...prev, recurrenceEndDate: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("maxOccurrencesOptional")}</label>
              <input
                type="number"
                name="maxOccurrences"
                value={recurrenceFields.maxOccurrences}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({ ...prev, maxOccurrences: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`bg-green-600 text-white px-4 py-2 rounded ${
            saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {saving ? t("saving") : t("addTransaction")}
        </button>
      </form>

      {/* Modal de catch-up */}
      {catchUpPrompt.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-2">{t("recurringCatchUpTitle")}</h3>
            <p className="text-sm text-gray-700">
              {t("recurringCatchUpBody", {
                count: catchUpPrompt.pending.count,
                first: catchUpPrompt.pending.first?.toLocaleDateString(),
                last: catchUpPrompt.pending.last?.toLocaleDateString(),
              })}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  const payload = catchUpPrompt.payload;
                  setCatchUpPrompt({ open: false, pending: { count: 0 }, payload: null });
                  doCreate(payload, false); // NO catch-up
                }}
              >
                {t("no")}
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => {
                  const payload = catchUpPrompt.payload;
                  setCatchUpPrompt({ open: false, pending: { count: 0 }, payload: null });
                  doCreate(payload, true); // SÍ catch-up
                }}
              >
                {t("yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
