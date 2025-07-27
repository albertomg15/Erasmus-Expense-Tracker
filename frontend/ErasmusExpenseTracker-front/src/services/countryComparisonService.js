import { API_BASE_URL, getAuthHeaders } from "./config";

export const fetchCountryComparison = async (forceIncludeIncomplete = true) => {
  const res = await fetch(
    `${API_BASE_URL}/api/country-comparison?forceIncludeIncomplete=${forceIncludeIncomplete}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch country comparison data");
  }

  return res.json();
};
