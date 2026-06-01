const User = require('../models/User');
const Task = require('../models/Tasks');
const AppError = require('../utils/Apperror');
const asyncHandler = require('../utils/asyncHandler');


const getAllUsers = asyncHandler(async (req, res, next) => {
  let query = {};

  if (req.user.role === 'manager') {
    query.role = 'employee';
  } else if (req.query.role) {
    query.role = req.query.role;
  }


  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;


  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await User.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: {
      items: users,
      page,
      limit,
      totalItems,
      totalPages
    }
  });
});


const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  
  if (!name || !email || !password || !role) {
    return next(new AppError('Please provide all user fields: name, email, password, role', 400));
  }
  if (!['manager', 'employee'].includes(role)) {
    return next(new AppError('Admin can only create users with "manager" or "employee" roles', 400));
  }

  
  const newUser = await User.create({
    name,
    email,
    password,
    role
  });

  newUser.password = undefined;

  res.status(201).json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
    data: { user: newUser }
  });
});


const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot deactivate your own admin account!', 400));
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Account of ${user.name} has been deactivated successfully`
  });
});


const getSystemStats = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const [
    totalUsers,
    totalEmployees,
    totalManagers,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    underReviewTasks, 
    completedTasks,
    overdueTasks
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'employee' }),
    User.countDocuments({ role: 'manager' }),
    Task.countDocuments(),
    Task.countDocuments({ status: 'Pending' }),
    Task.countDocuments({ status: 'In Progress' }),
    Task.countDocuments({ status: 'Under Review' }), 
    Task.countDocuments({ status: 'Completed' }),
    Task.countDocuments({
      dueDate: { $lt: now },
      status: { $ne: 'Completed' }
    })
  ]);

  res.status(200).json({
    success: true,
    message: 'System statistics fetched successfully',
    data: {
      stats: {
        totalUsers,
        totalEmployees,
        totalManagers,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        underReviewTasks, 
        completedTasks,
        overdueTasks
      }
    }
  });
});


module.exports = {
  getAllUsers,
  createUser,
  deactivateUser,
  getSystemStats
};
