import User from '../../models/User.js'; 

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { category = 'global' } = req.query; 

    let query = {};
    if (category !== 'global') {
      query = { skillLevel: category }; 
    }

    const topUsers = await User.find(query)
      .select('username statistics.eloRating statistics.duelsWon statistics.problemsSolved avatar') 
      .sort({ 'statistics.eloRating': -1 }) 
      .limit(50);
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      elo: user.statistics?.eloRating || 1200,
      duelsWon: user.statistics?.duelsWon || 0,
      problemsSolved: user.statistics?.problemsSolved || 0,
      avatar: user.avatar || null 
    }));

    res.status(200).json({
      success: true,
      category,
      lastUpdated: new Date(),
      data: leaderboard
    });

  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};