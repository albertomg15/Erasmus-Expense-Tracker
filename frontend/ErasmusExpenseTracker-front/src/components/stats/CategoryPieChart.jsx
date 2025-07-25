import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B10DC9",
  "#FF4136", "#2ECC40", "#0074D9", "#FFDC00", "#AAAAAA",
];

const CategoryPieChart = ({ data }) => {
  const { t } = useTranslation("statistics");

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: parseFloat(value),
  }));

  const totalValue = chartData.reduce((sum, entry) => sum + entry.value, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const entry = chartData[index];
    const percent = ((entry.value / totalValue) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="#444"
        fontSize="10"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {entry.name.length > 16 ? entry.name.slice(0, 16) + "…" : entry.name} ({percent}%)
      </text>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-8">
      <div className="w-full flex justify-center">
        <PieChart width={320} height={320}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="mt-6 md:mt-0 md:ml-8">
        <ul className="text-sm space-y-2">
          {chartData.map((entry, index) => {
            const percent = ((entry.value / totalValue) * 100).toFixed(0);
            return (
              <li key={index} className="flex items-center gap-3">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="truncate max-w-[180px]">
                  {entry.name} ({percent}%)
                </span>
                <span className="text-gray-500 whitespace-nowrap">
                  ({entry.value.toFixed(2)}€)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CategoryPieChart;
