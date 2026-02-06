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

    const submissions = await Submission.find({ user: userId });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("GET MY SUBMISSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export default {
  getMySubmission,
};
