import User from '../../models/User.js';

// Standard Elo formula with K=32
const K = 32;

const getExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

export const updateEloAfterDuel = async (winnerUsername, loserUsername) => {
  try {
    const [winner, loser] = await Promise.all([
      User.findOne({ username: winnerUsername }),
      User.findOne({ username: loserUsername })
    ]);

    if (!winner || !loser) {
      console.error('Elo update failed: could not find users', winnerUsername, loserUsername);
      return;
    }

    const winnerRating = winner.statistics.eloRating;
    const loserRating = loser.statistics.eloRating;

    const expectedWinner = getExpectedScore(winnerRating, loserRating);
    const expectedLoser = getExpectedScore(loserRating, winnerRating);

    // Winner gets 1, Loser gets 0
    const newWinnerRating = Math.round(winnerRating + K * (1 - expectedWinner));
    const newLoserRating = Math.round(loserRating + K * (0 - expectedLoser));

    // Update both users atomically
    await Promise.all([
      User.findOneAndUpdate(
        { username: winnerUsername },
        {
          $set: { 'statistics.eloRating': newWinnerRating },
          $inc: { 'statistics.duelsWon': 1 }
        }
      ),
      User.findOneAndUpdate(
        { username: loserUsername },
        {
          $set: { 'statistics.eloRating': newLoserRating },
          $inc: { 'statistics.duelsLost': 1 }
        }
      )
    ]);

    console.log(`📊 Elo updated — ${winnerUsername}: ${winnerRating} → ${newWinnerRating} | ${loserUsername}: ${loserRating} → ${newLoserRating}`);

    // Return the deltas so the frontend can show accurate numbers
    return {
      winnerDelta: newWinnerRating - winnerRating,
      loserDelta: newLoserRating - loserRating
    };

  } catch (err) {
    console.error('Elo update error:', err);
  }
};