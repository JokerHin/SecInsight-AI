"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface VulnerabilityIssue {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  priorityScore: number;
  package: string;
}

interface RiskChartProps {
  data: VulnerabilityIssue[];
}

const COLORS = {
  Critical: "#dc2626",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

// Helper function to get color with fallback
const getColorForSeverity = (severity: string): string => {
  const normalized =
    severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
  return COLORS[normalized as keyof typeof COLORS] || "#64748b"; // fallback to gray
};

export function RiskChart({ data }: RiskChartProps) {
  // Count by severity
  const severityCounts = data.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Group by priority score ranges for bar chart
  const priorityRanges = [
    { range: "9-10 (Critical)", min: 9, max: 10, count: 0 },
    { range: "7-8 (High)", min: 7, max: 8.9, count: 0 },
    { range: "5-6 (Medium)", min: 5, max: 6.9, count: 0 },
    { range: "3-4 (Low)", min: 3, max: 4.9, count: 0 },
    { range: "1-2 (Info)", min: 1, max: 2.9, count: 0 },
  ];

  data.forEach((issue) => {
    const range = priorityRanges.find(
      (r) => issue.priorityScore >= r.min && issue.priorityScore <= r.max
    );
    if (range) range.count++;
  });

  const barData = priorityRanges.map((r) => ({
    name: r.range,
    count: r.count,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Severity Distribution Pie Chart */}
      <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-6 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">
          📊 Severity Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForSeverity(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Priority Score Distribution Bar Chart */}
      <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-6 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">
          🎯 AI Priority Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="name"
              angle={-15}
              textAnchor="end"
              height={80}
              fontSize={12}
              stroke="#94a3b8"
            />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Bar dataKey="count" fill="#06b6d4" name="Vulnerabilities" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Packages with Issues */}
      <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-6 md:col-span-2 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">
          📦 Top Affected Packages
        </h3>
        <div className="space-y-2">
          {Object.entries(
            data.reduce((acc, issue) => {
              acc[issue.package] = (acc[issue.package] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([pkg, count]) => (
              <div
                key={pkg}
                className="flex items-center justify-between p-3 bg-slate-900 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <code className="text-sm font-mono text-cyan-300">{pkg}</code>
                <span className="px-3 py-1 bg-cyan-600 text-white rounded-full text-sm font-semibold">
                  {count} {count === 1 ? "issue" : "issues"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
