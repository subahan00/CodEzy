import mongoose from "mongoose";
import User from "../../models/User.js";
import Submission from "../../models/submission.model.js";

export const getMySubmission = async (req, res) => {
  try {
    console.log("REQ.USER =>", req.user);

    const userId = req.user.userId;
    console.log("USER ID =>", userId);

    const user = await User.findById(userId);
    console.log("USER =>", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const submissions = await Submission.find({ user: userId });
    console.log("SUBMISSIONS =>", submissions);

    res.status(200).json(submissions);
  } catch (error) {
    console.error("GET MY SUBMISSIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export default {
  getMySubmission,
};
