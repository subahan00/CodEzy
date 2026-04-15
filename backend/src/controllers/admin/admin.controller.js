import User from '../../models/User.js'; 

// ── FETCH ALL USERS ──
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users, sort by Elo rating (highest first), but exclude passwords
        const users = await User.find().select('-password').sort({ 'statistics.eloRating': -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// ── UPDATE USER ROLE/STATUS ──
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, isBanned } = req.body; // What the admin wants to change

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Don't let an admin accidentally ban themselves
        if (userId === req.user.id && isBanned === true) {
            return res.status(400).json({ success: false, message: "You cannot ban yourself." });
        }

        // Apply updates if they were provided in the request
        if (role) user.role = role;
        if (isBanned !== undefined) user.isBanned = isBanned;

        await user.save();

        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};
export default { getAllUsers, updateUserStatus };