import { useEffect, useState } from "react";
import { fetchCountryComparison } from "../services/countryComparisonService";
import { Card, CardContent } from "../components/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CountryComparison() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    fetchCountryComparison(true)
      .then((response) => {
        setIncomplete(response.incompleteData);
        setData(response.comparisons);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading comparison data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Country Comparison</h2>

      {incomplete && (
        <p className="text-yellow-600 font-medium">
          Your data is incomplete. Only country averages are shown.
        </p>
      )}

      {data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        data.map((item) => (
          <Card key={item.category}>
            <CardContent>
              <h3 className="text-lg font-bold mb-2">{item.category}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: "Comparison",
                      "You": item.userAverage ?? 0,
                      "Country Avg": item.countryAverage,
                    },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="You" fill="#8884d8" />
                  <Bar dataKey="Country Avg" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
