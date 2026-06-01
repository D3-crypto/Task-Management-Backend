const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  reviewTask
} = require('../controllers/task.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(restrictTo('manager'), createTask) 
  .get(getAllTasks);                      

router.route('/:id')
  .get(getTaskById)                       
  .put(restrictTo('manager'), updateTask) 
  .delete(restrictTo('manager'), deleteTask); 

router.patch('/:id/status', restrictTo('employee'), updateTaskStatus);
router.patch('/:id/review', restrictTo('manager'), reviewTask);

module.exports = router;
