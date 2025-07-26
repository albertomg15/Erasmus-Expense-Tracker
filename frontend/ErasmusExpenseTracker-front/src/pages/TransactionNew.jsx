import { useEffect, useState } from "react";
import { createTransaction, createRecurringTransaction } from "../services/transactionService";
import { getTripsByUserId } from "../services/tripService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAllCategoriesByUserId } from "../services/categoryService";
import CategorySelector from "../components/CategorySelector";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { parseJwt } from "../utils/tokenUtils";
import { getSupportedCurrencies } from "../services/exchangeRateService";




export default function TransactionNew() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
const preselectedTripId = searchParams.get("tripId");
const redirectTo = searchParams.get("redirectTo");
  const { t } = useTranslation("transactions");




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
    maxOccurrences: ""
  });

  const [trips, setTrips] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);


  useEffect(() => {
  async function fetchTripsAndHandlePreselection() {
    try {
      const userId = parseJwt(token).userId;
      const data = await getTripsByUserId(userId);

      if (Array.isArray(data)) {
        setTrips(data);

        // Si llegamos desde un tripId válido y existente
        if (
          preselectedTripId &&
          data.some((t) => t.tripId === preselectedTripId)
        ) {
          setForm((prev) => ({ ...prev, tripId: preselectedTripId }));
        }
      } else {
        console.error("Expected array for trips, got:", data);
        setTrips([]);
      }
    } catch (err) {
      console.error("Error loading trips", err);
      setTrips([]); // fallback seguro
    }
  }

  if (token) {
    fetchTripsAndHandlePreselection();
  }
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      toast.error("Amount must be a positive number.");
      return;
    }

    if (!form.currency.trim()) {
      toast.error("Currency is required.");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!form.date) {
      toast.error("Date is required.");
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


    let payload = {
      ...transaction
    };

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

    }

    setSaving(true);
    try {
      if (isRecurring) {
        await createRecurringTransaction(payload);
      } else {
        await createTransaction(payload);
      }

      toast.success("Transaction created successfully.");
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate("/dashboard"); // fallback
      }

    } catch (err) {
      console.error("Failed to create transaction", err);
      toast.error("Error creating transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("newTitle")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <div>
          <label className="block mb-1 font-medium">{t("type")}</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="EXPENSE">{t("expense")}</option>
            <option value="INCOME">{t("income")}</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("amount")}</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full p-2 border rounded" />
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
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("descriptionOptional")}</label>
          <input name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
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
                  setForm((prev) => ({ ...prev, tripId: "" }));
                }
              }}
            />
            <span>{t("isRecurring")}</span>
            <span className="text-blue-500 cursor-pointer" title={t("recurringHint")}>ℹ️</span>
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">{t("recurrencePattern")}</label>
              <select
                name="recurrencePattern"
                value={recurrenceFields.recurrencePattern}
                onChange={(e) => setRecurrenceFields((prev) => ({ ...prev, recurrencePattern: e.target.value }))}
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
                onChange={(e) => setRecurrenceFields((prev) => ({ ...prev, nextExecution: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("recurrenceEndDateOptional")}</label>
              <input
                type="date"
                name="recurrenceEndDate"
                value={recurrenceFields.recurrenceEndDate}
                onChange={(e) => setRecurrenceFields((prev) => ({ ...prev, recurrenceEndDate: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("maxOccurrencesOptional")}</label>
              <input
                type="number"
                name="maxOccurrences"
                value={recurrenceFields.maxOccurrences}
                onChange={(e) => setRecurrenceFields((prev) => ({ ...prev, maxOccurrences: e.target.value }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`bg-green-600 text-white px-4 py-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {saving ? t("saving") : t("addTransaction")}
        </button>
      </form>
    </div>
  );
}