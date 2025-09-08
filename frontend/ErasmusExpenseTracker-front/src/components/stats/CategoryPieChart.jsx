import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#0088FE","#00C49F","#FFBB28","#FF8042","#B10DC9","#FF4136","#2ECC40","#0074D9","#FFDC00","#AAAAAA"];

const CategoryPieChart = ({ data, currency = "EUR" }) => {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }));
  const total = chartData.reduce((s, e) => s + e.value, 0) || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="w-full aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius="75%" labelLine={false}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(Number(v) || 0, currency)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="text-sm space-y-2">
        {chartData.map((e, i) => {
          const pct = Math.round((e.value / total) * 100);
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="truncate max-w-[180px]">{e.name}</span>
              <span className="text-gray-500 whitespace-nowrap ml-auto">
                {pct}% · {formatCurrency(e.value, currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryPieChart;
