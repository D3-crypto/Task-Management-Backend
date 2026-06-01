const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Task Title'],
        trim: true,
        maxlength:[300, 'Task title cannot exceed 300 characters']
    },
    description:{
        type: String,
        trim: true,
        required:[true, 'Task description'],
    },
    priority:{
        type: String,
        enum:{
            values: ['Low', 'Medium', 'High'],
            message: 'Priority must be either: Low, Medium, or High'
        },
        default: 'Low',
        index: true,
    },
    status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress','Under Review', 'Completed'],
      message: 'Status must be either: Pending, In Progress, Under Review, or Completed'
    },
    default: 'Pending',
    index: true
  },
assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this task to an employee'],
    index: true 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A task must have a creator (Manager)'],
    index: true 
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date'],
    index: true 
  }
}, 
{
  timestamps: true 
});
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;