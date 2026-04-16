import mongoose from "mongoose";
import User from "../../models/User.js";
import Submission from "../../models/submission.model.js";

export const getMySubmission = async (req, res) => {
  try {

    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const submissions = await Submission.find({ user: userId }).populate("content", "title slug");

    res.status(200).json(submissions);
  } catch (error) {
    console.error("GET MY SUBMISSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    
    const userId = req.user.userId;
    const { avatar, bio, github, linkedin } = req.body;

    // Find the user and update their fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: avatar || "",
          bio: bio || "",
          "socialLinks.github": github || "",
          "socialLinks.linkedin": linkedin || ""
        }
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return the password!

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export default {
  getMySubmission,
  updateProfile
};
