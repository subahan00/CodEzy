import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const tooltip = {
  contentStyle: {
    background: '#08060f',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 10,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  labelStyle:  { color: '#6b7280', fontSize: 10 },
  itemStyle:   { color: '#a5b4fc' },
  cursor:      { stroke: 'rgba(99,102,241,0.15)', strokeWidth: 1 },
};

const axisProps = {
  tick:  { fill: '#374151', fontSize: 10, fontFamily: 'monospace' },
  axisLine: { stroke: 'transparent' },
  tickLine: { stroke: 'transparent' },
};

const Empty = ({ msg }) => (
  <p className="text-gray-700 text-xs font-mono uppercase tracking-widest py-10 text-center">
    {msg}
  </p>
);

export const JourneyChart = ({ data }) => {
  if (!data?.length) return <Empty msg="Solve your first problem to start your journey." />;

  const chartData = data.map(d => ({ name: `#${d.count}`, solved: d.count, problem: d.problem }));

  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#111827" vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltip} formatter={(v, n, p) => [p.payload.problem, '']} />
        <Line
          type="monotone" dataKey="solved"
          stroke="#6366f1" strokeWidth={1.5}
          dot={{ fill: '#6366f1', r: 2.5, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#a5b4fc', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const VelocityChart = ({ data }) => {
  if (!data?.length) return <Empty msg="No weekly data yet." />;

  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#111827" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltip} formatter={v => [v, 'solved']} />
        <Bar dataKey="solved" fill="#4f46e5" radius={[3, 3, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
};