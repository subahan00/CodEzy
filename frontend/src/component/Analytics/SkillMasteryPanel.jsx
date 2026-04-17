const PREREQS = {
  'dp': ['recursion'],
  'graphs': ['trees', 'matrices'],
  'trees': ['linked-list'],
  'backtracking': ['recursion'],
  'binary-search': ['arrays'],
};

const SkillBar = ({ skill, mastery }) => {
  let color = 'bg-indigo-600';
  let glow = '';
  if (mastery >= 70) { color = 'bg-emerald-500'; glow = 'shadow-[0_0_8px_rgba(16,185,129,0.4)]'; }
  else if (mastery >= 40) { color = 'bg-yellow-500'; glow = 'shadow-[0_0_8px_rgba(234,179,8,0.3)]'; }
  else if (mastery < 20) { color = 'bg-red-500/70'; }

  return (
    <div className="group">
      <div className="flex justify-between text-[11px] font-mono mb-1 uppercase tracking-wider">
        <span className="text-gray-300 capitalize group-hover:text-white transition-colors">{skill}</span>
        <span className="text-gray-500">{Math.round(mastery)}/100</span>
      </div>
      <div className="w-full bg-[#161423] h-2 rounded-full overflow-hidden">
        <div
          className={`${color} ${glow} h-full rounded-full transition-all duration-1000`}
          style={{ width: `${mastery}%` }}
        />
      </div>
    </div>
  );
};

const SkillMasteryPanel = ({ skillMastery, nearUnlock }) => {
  if (!skillMastery?.length) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-wider">No skill data yet. Start solving problems.</p>
  );

  return (
    <div className="space-y-4">
      {skillMastery.map(([skill, mastery]) => (
        <div key={skill}>
          <SkillBar skill={skill} mastery={mastery} />
          {PREREQS[skill] && mastery < 40 && (
            <p className="text-[10px] text-red-400/70 font-mono mt-1 ml-1">
              ⚠ Requires: {PREREQS[skill].join(', ')}
            </p>
          )}
        </div>
      ))}

      {nearUnlock?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800/60">
          <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-mono mb-3">
            ⚡ Close to advanced unlock
          </p>
          {nearUnlock.map(([skill, mastery]) => (
            <div key={skill} className="flex justify-between text-xs font-mono text-gray-400 py-1">
              <span className="capitalize">{skill}</span>
              <span className="text-yellow-400">{Math.round(mastery)}% — {Math.ceil((80 - mastery))} pts to advanced</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillMasteryPanel;