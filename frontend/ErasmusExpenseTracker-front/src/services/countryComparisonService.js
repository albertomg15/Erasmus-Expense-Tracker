import { API_BASE_URL, getAuthHeaders } from "./config";



export const fetchCountryComparison = async (month, year) => {
  const res = await fetch(
    `${API_BASE_URL}/api/country-comparison?month=${month}&year=${year}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    if (res.status === 400) throw new Error("consent_required");
    throw new Error("Failed to fetch comparison data");
  }

  return res.json();
};

