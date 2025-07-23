import { useEffect, useState } from "react";
import { createTransaction, createRecurringTransaction } from "../services/transactionService";
import { getTripsByUserId } from "../services/tripService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAllCategoriesByUserId } from "../services/categoryService";
import CategorySelector from "../components/CategorySelector";

export default function TransactionNew() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    async function fetchTrips() {
      try {
        const userId = parseJwt(token).userId;
        const data = await getTripsByUserId(userId);
        setTrips(data);
      } catch (err) {
        console.error("Error loading trips", err);
      }
    }

    if (token) fetchTrips();
  }, [token]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      ...form,
      amount: parseFloat(form.amount),
      currency: form.currency.toUpperCase(),
      trip: form.tripId ? { tripId: form.tripId } : null,
      category: { categoryId: form.category },
    };

    let payload = {
      ...transaction
    };

    if (isRecurring) {
      payload = {
        ...payload,
        ...recurrenceFields,
        recurrenceEndDate: recurrenceFields.recurrenceEndDate || null,
        maxOccurrences: recurrenceFields.maxOccurrences
          ? parseInt(recurrenceFields.maxOccurrences)
          : null,
        executedOccurrences: 0,
        active: true
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
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create transaction", err);
      toast.error("Error creating transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Amount</label>
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
          <label className="block mb-1 font-medium">Currency</label>
          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <CategorySelector
          categories={categories}
          setCategories={setCategories}
          selectedCategoryId={form.category}
          setSelectedCategoryId={(id) =>
            setForm((prev) => ({ ...prev, category: id }))
          }
          userId={parseJwt(token).userId}
        />

        <div>
          <label className="block mb-1 font-medium">Date</label>
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
          <label className="block mb-1 font-medium">Description (optional)</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {trips.length > 0 && (
          <div>
            <label className="block mb-1 font-medium">Associated Trip (optional)</label>
            <select
              name="tripId"
              value={form.tripId}
              onChange={handleChange}
              disabled={isRecurring}
              className="w-full p-2 border rounded bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- None --</option>
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
            <span>Is this a recurring transaction?</span>
            <span
              className="text-blue-500 cursor-pointer"
              title="A recurring transaction will automatically generate a new standard transaction when the next execution date is reached."
            >
              ℹ️
            </span>
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Recurrence Pattern</label>
              <select
                name="recurrencePattern"
                value={recurrenceFields.recurrencePattern}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({
                    ...prev,
                    recurrencePattern: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Next Execution Date</label>
              <input
                type="date"
                name="nextExecution"
                value={recurrenceFields.nextExecution}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({
                    ...prev,
                    nextExecution: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Recurrence End Date (optional)</label>
              <input
                type="date"
                name="recurrenceEndDate"
                value={recurrenceFields.recurrenceEndDate}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({
                    ...prev,
                    recurrenceEndDate: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Max Occurrences (optional)</label>
              <input
                type="number"
                name="maxOccurrences"
                value={recurrenceFields.maxOccurrences}
                onChange={(e) =>
                  setRecurrenceFields((prev) => ({
                    ...prev,
                    maxOccurrences: e.target.value,
                  }))
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
          {saving ? "Saving..." : "Add Transaction"}
        </button>
      </form>
    </div>
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
