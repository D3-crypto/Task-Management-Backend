const Task = require('../models/Tasks');
const User = require('../models/User');
const AppError = require('../utils/Apperror');
const asyncHandler = require('../utils/asyncHandler');


const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, priority, assignedEmployee, dueDate } = req.body;

  const employee = await User.findById(assignedEmployee);
  if (!employee) {
    return next(new AppError('Assigned employee not found', 404));
  }
  if (employee.role !== 'employee') {
    return next(new AppError('Tasks can only be assigned to users with the Employee role', 400));
  }
  if (!employee.isActive) {
    return next(new AppError('Cannot assign task to an inactive employee', 400));
  }

  const task = await Task.create({
    title,
    description,
    priority,
    assignedEmployee,
    dueDate,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});


const getAllTasks = asyncHandler(async (req, res, next) => {
  
  let query = {};
  if (req.user.role === 'manager') {
    query.createdBy = req.user._id;
  } else if (req.user.role === 'employee') {
    query.assignedEmployee = req.user._id;
  }

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.assignedEmployee && req.user.role !== 'employee') {
    query.assignedEmployee = req.query.assignedEmployee;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find(query)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await Task.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: 'Tasks fetched successfully',
    data: {
      items: tasks,
      page,
      limit,
      totalItems,
      totalPages
    }
  });
});


const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (req.user.role === 'employee' && task.assignedEmployee._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to view this task', 403));
  }
  if (req.user.role === 'manager' && task.createdBy._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view tasks created by other managers', 403));
  }

  res.status(200).json({
    success: true,
    data: { task }
  });
});


const updateTask = asyncHandler(async (req, res, next) => {
  const { title, description, priority, assignedEmployee, dueDate, status } = req.body;

  let task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to update this task', 403));
  }

  if (assignedEmployee && assignedEmployee !== task.assignedEmployee.toString()) {
    const employee = await User.findById(assignedEmployee);
    if (!employee || employee.role !== 'employee' || !employee.isActive) {
      return next(new AppError('Please provide a valid active Employee ID', 400));
    }
    task.assignedEmployee = assignedEmployee;
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (status) task.status = status;

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task: updatedTask }
  });
});


const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to delete this task', 403));
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});


const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new AppError('Please provide a task status', 400));
  }
  if (!['In Progress', 'Under Review'].includes(status)) {
    return next(new AppError('Employees can only set status to "In Progress" or "Under Review". Managers must approve completion.', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  
  if (task.assignedEmployee.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update the status of tasks assigned to you', 403));
  }

  task.status = status;
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: `Task status updated to "${status}"`,
    data: { task: updatedTask }
  });
});

const reviewTask = asyncHandler(async (req, res, next) => {
  const { action } = req.body; 
  if (!action || !['approve', 'reject'].includes(action)) {
    return next(new AppError('Please provide a valid review action: "approve" or "reject"', 400));
  }
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }
  if (task.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to review this task', 403));
  }
  if (task.status !== 'Under Review') {
    return next(new AppError('Only tasks with status "Under Review" can be approved or rejected', 400));
  }
  if (action === 'approve') {
    task.status = 'Completed';
  } else {
    task.status = 'Pending'; 
  }
  await task.save();
  const updatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email')
    .populate('createdBy', 'name email');
  res.status(200).json({
    success: true,
    message: `Task successfully ${action === 'approve' ? 'approved' : 'rejected'}. Status is now "${task.status}"`,
    data: { task: updatedTask }
  });
});

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  reviewTask,
};
