const PREREQS = {
  dp:           ['recursion'],
  graphs:       ['trees', 'matrices'],
  trees:        ['linked-list'],
  backtracking: ['recursion'],
  'binary-search': ['arrays'],
};

const bar = (mastery) => {
  if (mastery >= 70) return { fill: 'bg-emerald-500', text: 'text-emerald-400' };
  if (mastery >= 40) return { fill: 'bg-amber-500',   text: 'text-amber-400'  };
  return                     { fill: 'bg-rose-600/70', text: 'text-rose-400'   };
};

const SkillBar = ({ skill, mastery }) => {
  const { fill, text } = bar(mastery);
  return (
    <div className="group">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-mono capitalize text-gray-400 group-hover:text-white transition-colors">
          {skill}
        </span>
        <span className={`text-xs font-mono font-bold ${text}`}>{Math.round(mastery)}</span>
      </div>
      <div className="w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`${fill} h-full rounded-full transition-all duration-700`}
          style={{ width: `${mastery}%` }}
        />
      </div>
      {PREREQS[skill] && mastery < 40 && (
        <p className="text-[10px] text-rose-400/60 font-mono mt-1">
          requires: {PREREQS[skill].join(', ')}
        </p>
      )}
    </div>
  );
};

const SkillMasteryPanel = ({ skillMastery, nearUnlock }) => {
  if (!skillMastery?.length) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
      No skill data yet.
    </p>
  );

  return (
    <div className="space-y-4">
      {skillMastery.map(([skill, mastery]) => (
        <SkillBar key={skill} skill={skill} mastery={mastery} />
      ))}

      {nearUnlock?.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-800/50 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80">
            ⚡ close to advanced unlock
          </span>
          {nearUnlock.map(([skill, mastery]) => (
            <div key={skill} className="flex justify-between text-xs font-mono text-gray-500">
              <span className="capitalize">{skill}</span>
              <span className="text-amber-400">{Math.round(mastery)}% — {Math.ceil(80 - mastery)} pts left</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillMasteryPanel;