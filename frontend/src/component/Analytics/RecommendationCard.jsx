import { Link } from 'react-router-dom';
import { FiZap, FiArrowRight } from 'react-icons/fi';

const DIFF_STYLES = {
  beginner:     'text-emerald-400 border-emerald-900 bg-emerald-900/20',
  intermediate: 'text-amber-400   border-amber-900   bg-amber-900/20',
  advanced:     'text-rose-400    border-rose-900    bg-rose-900/20',
};

const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return (
    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
      No recommendation available yet — keep solving!
    </p>
  );

  const diff = recommendation.difficulty?.toLowerCase() || 'beginner';
  const diffStyle = DIFF_STYLES[diff] || DIFF_STYLES.beginner;

  return (
    <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-[#08060f] to-[#08060f] p-6 md:p-8">
      {/* top accent line */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <FiZap size={12} className="text-indigo-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] font-semibold text-indigo-400">
              AI Recommended
            </span>
          </div>

          <h2 className="text-xl font-black text-white leading-snug">
            {recommendation.title}
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${diffStyle}`}>
              {diff}
            </span>
            {recommendation.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        to={`/problem/${recommendation.slug}`}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-colors"
      >
        Start Challenge <FiArrowRight size={11} />
      </Link>
    </div>
  );
};

export default RecommendationCard;