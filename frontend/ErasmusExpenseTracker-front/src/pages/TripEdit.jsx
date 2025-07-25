import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTripById, updateTrip } from "../services/tripService";
import { getAllTags } from "../services/tagService";
import { toast } from "react-hot-toast";
import TagSelector from "../components/TagSelector";
import { useAuth } from "../context/AuthContext";
import { parseJwt } from "../utils/tokenUtils";
import { useTranslation } from "react-i18next";



export default function TripEdit() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const { token } = useAuth();
  const userId = parseJwt(token).userId;
    const { t } = useTranslation("trips");



  useEffect(() => {
    async function loadData() {
      try {
        const trip = await getTripById(tripId);
        setForm({ ...trip });
        setSelectedTags(trip.tags || []);
      } catch (err) {
        console.error("Failed to load trip", err);
        toast.error("Trip not found");
        navigate("/trips");
      }
    }

    loadData();
  }, [tripId, navigate]);

  useEffect(() => {
    getAllTags().then(setAvailableTags);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    tripId, // 👈 lo extraemos para descartarlo
    ...rest
  } = form;

  const payload = {
    ...rest,
    estimatedBudget: rest.estimatedBudget
      ? parseFloat(rest.estimatedBudget)
      : null,
    tags: selectedTags,
  };

  setSaving(true);
  try {
    await updateTrip(tripId, payload); // 👈 aquí seguimos usando tripId como path param
    toast.success("Trip updated successfully");
    navigate("/trips");
  } catch (err) {
    console.error("Failed to update trip", err);
    toast.error("Failed to update trip");
  } finally {
    setSaving(false);
  }
};


  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("editTitle")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <div>
          <label className="block font-medium mb-1">{t("tripName")}</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("destination")}</label>
          <input type="text" name="destination" value={form.destination} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">{t("startDate")}</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">{t("endDate")}</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">{t("estimatedBudget")}</label>
          <input type="number" name="estimatedBudget" value={form.estimatedBudget || ""} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("currency")}</label>
          <input type="text" name="currency" value={form.currency || ""} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("notes")}</label>
          <textarea name="notes" value={form.notes || ""} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
        </div>

        <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />

        <button type="submit" disabled={saving} className={`bg-blue-600 text-white px-4 py-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""}`}>
          {saving ? t("saving") : t("saveChanges")}
        </button>
      </form>
    </div>
  );
}