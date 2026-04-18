const LABELS = {
  logic_error:               { label: 'Logic Error',          desc: 'Wrong approach or flawed reasoning', bar: 'bg-rose-500'   },
  edge_case:                 { label: 'Edge Case',            desc: 'Missing boundary conditions',        bar: 'bg-orange-500' },
  inefficient_algo:          { label: 'Inefficient Algorithm',desc: 'TLE or suboptimal solution',         bar: 'bg-amber-500'  },
  misunderstood_requirements:{ label: 'Misread Problem',      desc: 'Solution solves wrong problem',      bar: 'bg-violet-500' },
  syntax_error:              { label: 'Syntax Error',         desc: 'Compilation/parsing failures',       bar: 'bg-pink-500'   },
};

const WeaknessPanel = ({ failureProfile }) => {
  const entries = Object.entries(failureProfile || {}).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, c]) => s + c, 0);

  if (!entries.length) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">No failure data yet.</p>
  );

  return (
    <div className="space-y-5">
      {entries.map(([key, count]) => {
        const { label, desc, bar } = LABELS[key] || { label: key, desc: '', bar: 'bg-gray-500' };
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key} className="group">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <span className="text-xs font-mono text-rose-400 group-hover:text-rose-300 transition-colors">
                  {label}
                </span>
                <span className="text-[10px] font-mono text-gray-600 ml-2 normal-case">
                  {desc}
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-600 shrink-0 ml-2">{pct}%</span>
            </div>
            <div className="w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`${bar} h-full rounded-full opacity-75 transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-700 pt-3 border-t border-gray-800/40">
        Based on {total} AI-classified failures
      </p>
    </div>
  );
};

export default WeaknessPanel;