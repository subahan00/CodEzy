import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const tooltipStyle = {
  contentStyle: { background: '#0b0914', border: '1px solid #374151', borderRadius: 8 },
  labelStyle: { color: '#9ca3af', fontSize: 11 },
  itemStyle: { color: '#a5b4fc', fontSize: 12 },
};

export const JourneyChart = ({ data }) => {
  if (!data?.length) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-wider py-8 text-center">
      Solve your first problem to start your journey.
    </p>
  );

  const chartData = data.map((d, i) => ({
    name: `#${d.count}`,
    solved: d.count,
    problem: d.problem,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
        <Tooltip {...tooltipStyle} formatter={(v, n, p) => [p.payload.problem, 'Problem']} />
        <Line
          type="monotone" dataKey="solved"
          stroke="#818cf8" strokeWidth={2}
          dot={{ fill: '#818cf8', r: 3 }}
          activeDot={{ r: 5, fill: '#a5b4fc' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const VelocityChart = ({ data }) => {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Problems solved']} />
        <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};