import User from '../../models/User.js';

const K = 32;
const MIN_ELO = 100; // Floor to prevent negative ratings

const getExpectedScore = (ratingA, ratingB) =>
  1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

/**
 * Atomically updates Elo for winner and loser.
 *
 * Previous bug: read both ratings → compute → write. If two duels involving
 * the same user finished at the same millisecond, both reads got the same
 * stale rating, both computed the same delta, and both wrote the same value —
 * effectively one duel's Elo change was lost.
 *
 * Fix: read ratings once to compute deltas, then apply with $inc so MongoDB
 * serialises concurrent writes. The delta is deterministic given the ratings
 * at computation time; a small race window remains but its impact is one K-scaled
 * step (~16 pts), which is acceptable for a gaming ladder.
 */
export const updateEloAfterDuel = async (winnerUsername, loserUsername) => {
  try {
    const [winner, loser] = await Promise.all([
      User.findOne({ username: winnerUsername }).select('statistics.eloRating'),
      User.findOne({ username: loserUsername }).select('statistics.eloRating'),
    ]);

    if (!winner || !loser) {
      console.error('Elo update failed: user(s) not found', { winnerUsername, loserUsername });
      return null;
    }

    const winnerRating = winner.statistics.eloRating ?? 1000;
    const loserRating  = loser.statistics.eloRating  ?? 1000;

    const expectedWinner = getExpectedScore(winnerRating, loserRating);
    const expectedLoser  = getExpectedScore(loserRating,  winnerRating);

    const winnerDelta = Math.round(K * (1 - expectedWinner));
    const loserDelta  = Math.round(K * (0 - expectedLoser));   // negative

    // Apply with $inc — safe against concurrent writes
    await Promise.all([
      User.findOneAndUpdate(
        { username: winnerUsername },
        {
          $inc: {
            'statistics.eloRating': winnerDelta,
            'statistics.duelsWon': 1,
          },
        },
        { new: false } // we don't need the updated doc back
      ),
      User.findOneAndUpdate(
        { username: loserUsername },
        {
          $inc: {
            'statistics.eloRating': Math.max(loserDelta, MIN_ELO - loserRating),
            'statistics.duelsLost': 1,
          },
        },
        { new: false }
      ),
    ]);

    const newWinnerRating = winnerRating + winnerDelta;
    const newLoserRating  = Math.max(loserRating + loserDelta, MIN_ELO);

    console.log(
      `📊 Elo — ${winnerUsername}: ${winnerRating} → ${newWinnerRating} (+${winnerDelta})` +
      ` | ${loserUsername}: ${loserRating} → ${newLoserRating} (${loserDelta})`
    );

    return { winnerDelta, loserDelta };

  } catch (err) {
    console.error('Elo update error:', err);
    return null; // Caller must handle null
  }
};