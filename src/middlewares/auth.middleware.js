const User = require('../models/User');
const AppError = require('../utils/Apperror');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');


const protect = asyncHandler(async (req, res, next) => {
  let token;

  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }


  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

 
  const decoded = verifyToken(token);

  
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  
  if (!currentUser.isActive) {
    return next(
      new AppError('Your account has been deactivated. Please contact an admin.', 401)
    );
  }

  
  req.user = currentUser;
  next();
});

module.exports = { protect };
