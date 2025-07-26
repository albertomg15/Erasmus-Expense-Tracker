import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransactionById,
  updateTransaction,
} from "../services/transactionService";
import {
  getRecurringTransactionById,
  updateRecurringTransaction,
} from "../services/recurringTransactionService";
import { getAllCategoriesByUserId } from "../services/categoryService";
import { getTripsByUserId } from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { parseJwt } from "../utils/tokenUtils";
import { useTranslation } from "react-i18next";
import { getSupportedCurrencies } from "../services/exchangeRateService";



export default function TransactionEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const userId = parseJwt(token).userId;
  const { t } = useTranslation("transactions");

  const [form, setForm] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);


  useEffect(() => {
    async function fetchData() {
      try {
        const [normal, currencies, cats, tripsData] = await Promise.all([
          getTransactionById(id),
          getSupportedCurrencies(),
          getAllCategoriesByUserId(userId),
          getTripsByUserId(userId)
        ]);
        setAvailableCurrencies(currencies || []);
        setCategories(cats || []);
        setTrips(tripsData || []);

        if (normal.recurrencePattern) {
          const recurring = await getRecurringTransactionById(id);
          setForm({ ...recurring });
          setIsRecurring(true);
        } else {
          setForm({ ...normal });
          setIsRecurring(false);
        }
      } catch (err) {
        toast.error("Transaction not found");
        navigate("/transactions");
      }
    }

    if (id && token) fetchData();
  }, [id, token, userId, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        currency: form.currency.toUpperCase(),
        date: form.date,
        description: form.description,
        categoryId: form.category?.categoryId || form.category,
        tripId: form.trip?.tripId || form.tripId || null,
        };

        if (isRecurring) {
        Object.assign(payload, {
            recurrencePattern: form.recurrencePattern,
            nextExecution: form.nextExecution,
            recurrenceEndDate: form.recurrenceEndDate || null,
            maxOccurrences: form.maxOccurrences ? parseInt(form.maxOccurrences) : null,
            active: !!form.active,
        });
        }


      if (isRecurring) {
        await updateRecurringTransaction(form.transactionId, payload);
      } else {
        await updateTransaction(form.transactionId, payload);
      }

      toast.success("Transaction updated successfully");
      navigate("/transactions");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("editTitle")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
        <div>
          <label className="block mb-1 font-medium">{t("type")}</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="EXPENSE">{t("expense")}</option>
            <option value="INCOME">{t("income")}</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("amount")}</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} className="w-full p-2 border rounded" />
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

        <div>
          <label className="block mb-1 font-medium">{t("category")}</label>
          <select
            name="category"
            value={form.category?.categoryId || form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">{t("selectCategory")}</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("date")}</label>
          <input name="date" type="date" value={form.date?.split("T")[0]} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block mb-1 font-medium">{t("description")}</label>
          <input name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        {trips.length > 0 && !isRecurring && (
          <div>
            <label className="block mb-1 font-medium">{t("tripOptional")}</label>
            <select
              name="tripId"
              value={form.trip?.tripId || form.tripId || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, tripId: e.target.value }))}
              className="w-full p-2 border rounded"
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

        {isRecurring && (
          <>
            <div>
              <label className="block mb-1 font-medium">{t("recurrencePattern")}</label>
              <select
                name="recurrencePattern"
                value={form.recurrencePattern}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="DAILY">{t("daily")}</option>
                <option value="WEEKLY">{t("weekly")}</option>
                <option value="MONTHLY">{t("monthly")}</option>
                <option value="YEARLY">{t("yearly")}</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("nextExecution")}</label>
              <input
                name="nextExecution"
                type="date"
                value={form.nextExecution?.split("T")[0]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("recurrenceEndDate")}</label>
              <input
                name="recurrenceEndDate"
                type="date"
                value={form.recurrenceEndDate?.split("T")[0] || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">{t("maxOccurrences")}</label>
              <input
                name="maxOccurrences"
                type="number"
                value={form.maxOccurrences || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
            />
            {t("active")}
            <span className="text-sm text-gray-500">{t("activeHint")}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`bg-blue-600 text-white px-4 py-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {saving ? t("saving") : t("saveChanges")}
        </button>
      </form>
    </div>
  );
}