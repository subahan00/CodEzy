import e from "express";

export const isAdmin = (req, res, next) => {
    console.log('req.user in isAdmin middleware:', req.user); // Debugging line
    console.log('User role:', req.user.role); // Debugging line
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admins only'
    });
  }
  next();
};

export const isLearner = (req, res, next) => {
        console.log('req.user in isAdmin middleware:', req.user); // Debugging line

    console.log('User role:', req.user.role); // Debugging line
  if (req.user.role !== 'learner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Learners only'
    });
  }
  next();
};
export default {isAdmin,isLearner};
