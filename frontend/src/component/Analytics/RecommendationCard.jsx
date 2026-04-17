import { Link } from 'react-router-dom';
import { FiZap, FiTarget, FiArrowRight } from 'react-icons/fi';

const DIFF_STYLES = {
  beginner: 'text-emerald-400 border-emerald-800 bg-emerald-900/20',
  intermediate: 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
  advanced: 'text-red-400 border-red-800 bg-red-900/20',
};

const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return (
    <div className="text-gray-600 text-xs font-mono uppercase tracking-wider">
      No recommendation available. Keep solving!
    </div>
  );

  const diff = recommendation.difficulty?.toLowerCase() || 'beginner';
  const diffStyle = DIFF_STYLES[diff] || DIFF_STYLES.beginner;

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-900/10 p-6">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="text-indigo-400" size={14} />
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold">
              AI Recommended
            </span>
          </div>

          <h3 className="text-white font-bold text-lg mb-2 leading-tight">
            {recommendation.title}
          </h3>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${diffStyle}`}>
              {diff}
            </span>
            {recommendation.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <FiTarget className="text-indigo-400/30 shrink-0" size={40} />
      </div>

      <Link
        to={`/problem/${recommendation.slug}`}
        className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-colors"
      >
        Start Challenge <FiArrowRight size={12} />
      </Link>
    </div>
  );
};

export default RecommendationCard;