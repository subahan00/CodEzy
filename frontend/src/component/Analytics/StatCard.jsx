const StatCard = ({ label, value, sub, color = 'text-white' }) => (
  <div className="bg-[#0b0914] border border-gray-800/60 rounded-xl p-5 flex flex-col gap-1 hover:border-gray-600 transition-colors">
    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</span>
    <span className={`text-3xl font-black font-mono ${color}`}>{value}</span>
    {sub && <span className="text-xs text-gray-600 font-mono">{sub}</span>}
  </div>
);

export default StatCard;