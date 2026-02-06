import e from "express";

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admins only'
    });
  }
  next();
};

export const isLearner = (req, res, next) => {
  if (req.user.role !== 'learner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Learners only'
    });
  }
  next();
};
export default {isAdmin,isLearner};
