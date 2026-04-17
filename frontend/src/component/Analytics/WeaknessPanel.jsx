const LABELS = {
  logic_error: { label: 'Logic Error', desc: 'Wrong approach or flawed reasoning', color: 'bg-red-500' },
  edge_case: { label: 'Edge Case', desc: 'Missing boundary conditions', color: 'bg-orange-500' },
  inefficient_algo: { label: 'Inefficient Algorithm', desc: 'TLE or suboptimal solution', color: 'bg-yellow-500' },
  misunderstood_requirements: { label: 'Misread Problem', desc: 'Solution solves wrong problem', color: 'bg-purple-500' },
  syntax_error: { label: 'Syntax Error', desc: 'Compilation/parsing failures', color: 'bg-pink-500' },
};

const WeaknessPanel = ({ failureProfile }) => {
  const entries = Object.entries(failureProfile || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, c]) => s + c, 0);

  if (!entries.length) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-wider">No failure data yet.</p>
  );

  return (
    <div className="space-y-5">
      {entries.map(([key, count]) => {
        const meta = LABELS[key] || { label: key, desc: '', color: 'bg-gray-500' };
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key} className="group">
            <div className="flex justify-between text-[11px] font-mono mb-1 uppercase tracking-wider">
              <div>
                <span className="text-red-400 group-hover:text-red-300 transition-colors">{meta.label}</span>
                <span className="text-gray-600 normal-case ml-2 text-[10px]">{meta.desc}</span>
              </div>
              <span className="text-gray-500">{pct}% ({count})</span>
            </div>
            <div className="w-full bg-[#161423] h-1.5 rounded-full overflow-hidden">
              <div className={`${meta.color} h-full rounded-full transition-all duration-1000 opacity-80`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}

      <div className="pt-3 border-t border-gray-800/60">
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          Based on {total} AI-classified failures
        </p>
      </div>
    </div>
  );
};

export default WeaknessPanel;