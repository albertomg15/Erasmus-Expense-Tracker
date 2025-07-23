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

export default function TransactionEdit() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const userId = parseJwt(token).userId;

  const [form, setForm] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const normal = await getTransactionById(id);
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

    if (id) fetchTransaction();
  }, [id, navigate]);

  useEffect(() => {
    if (token) {
      getAllCategoriesByUserId(userId).then(setCategories);
      getTripsByUserId(userId).then(setTrips);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        currency: form.currency.toUpperCase(),
        trip: form.trip?.tripId || form.tripId ? { tripId: form.trip?.tripId || form.tripId } : null,
        category: { categoryId: form.category?.categoryId || form.category },
      };

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
      <h1 className="text-2xl font-bold mb-4">Edit Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-xl">
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Currency</label>
          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            name="category"
            value={form.category?.categoryId || form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select category --</option>
            {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
                {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
            </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            name="date"
            type="date"
            value={form.date?.split("T")[0]}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {trips.length > 0 && !isRecurring && (
          <div>
            <label className="block mb-1 font-medium">Trip (optional)</label>
            <select
              name="tripId"
              value={form.trip?.tripId || form.tripId || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, tripId: e.target.value }))}
              className="w-full p-2 border rounded"
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

        {isRecurring && (
          <>
            <div>
              <label className="block mb-1 font-medium">Recurrence Pattern</label>
              <select
                name="recurrencePattern"
                value={form.recurrencePattern}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Next Execution</label>
              <input
                name="nextExecution"
                type="date"
                value={form.nextExecution?.split("T")[0]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Recurrence End Date</label>
              <input
                name="recurrenceEndDate"
                type="date"
                value={form.recurrenceEndDate?.split("T")[0] || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Max Occurrences</label>
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
                Active
                <span className="text-sm text-gray-500">(Uncheck to deactivate this recurring transaction)</span>
            </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`bg-blue-600 text-white px-4 py-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
