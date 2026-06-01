const User = require('../models/User');
const AppError = require('../utils/Apperror');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwt');

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }


  const user = await User.findOne({ email }).select('+password');

 
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }


  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact an admin.', 403));
  }

 
  const token = generateToken({ id: user._id, role: user.role });


  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

module.exports = {
  login,
  getMe
};
