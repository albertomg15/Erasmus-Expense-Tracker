import { useEffect, useState } from "react";
import { getTripsByUserId } from "../services/tripService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";


export default function TripsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
    const { t } = useTranslation("trips");


  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = parseJwt(token).userId;
        const data = await getTripsByUserId(userId);
        setTrips(data);
      } catch (err) {
        console.error("Error loading trips", err);
        toast.error("Failed to load trips");
      }
    };

    if (token) fetchTrips();
  }, [token]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("yourTrips")}</h1>
        <button onClick={() => navigate("/trips/new")} className="bg-green-600 text-white px-4 py-2 rounded">
          {t("newTrip")}
        </button>
      </div>

      {trips.length === 0 ? (
        <p>{t("noTripsYet")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div key={trip.tripId} onClick={() => navigate(`/trips/${trip.tripId}`)} className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{trip.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>
            </div>
          ))}
        </div>
      )}
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
