import { useEffect, useState } from "react";
import { createTrip } from "../services/tripService";
import { getAllTags } from "../services/tagService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import TagSelector from "../components/TagSelector";
import { useTranslation } from "react-i18next";



export default function TripNew() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
    const { t } = useTranslation("trips");


  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    currency: "EUR", 
    notes: "",
  });

  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to load tags", err);
      }
    }

    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = parseJwt(token).userId;

    const payload = {
      ...form,
      userId,
      estimatedBudget: form.estimatedBudget
        ? parseFloat(form.estimatedBudget)
        : null,
      tags: selectedTags,
    };

    setSaving(true);
    try {
      await createTrip(payload);
      toast.success("Trip created successfully!");
      navigate("/trips");
    } catch (err) {
      console.error("Failed to create trip", err);
      toast.error("Failed to create trip");
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("newTitle")}</h1>
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
          <label className="block font-medium mb-1">{t("estimatedBudgetOptional")}</label>
          <input type="number" name="estimatedBudget" value={form.estimatedBudget} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("currency")}</label>
          <input type="text" name="currency" value={form.currency} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">{t("notesOptional")}</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full p-2 border rounded" />
        </div>

        <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />

        <button type="submit" disabled={saving} className={`bg-green-600 text-white px-4 py-2 rounded ${saving ? "opacity-50 cursor-not-allowed" : ""}`}>
          {saving ? t("saving") : t("createTrip")}
        </button>
      </form>
    </div>
  );
}