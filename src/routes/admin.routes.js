const express = require('express');
const {
  getAllUsers,
  createUser,
  deactivateUser,
  getSystemStats
} = require('../controllers/admin.controller');

const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.route('/users')
  .get(restrictTo('admin', 'manager'), getAllUsers)
  .post(restrictTo('admin'), createUser);

router.route('/users/:id')
  .delete(restrictTo('admin'), deactivateUser);

router.route('/stats')
  .get(restrictTo('admin'), getSystemStats);

module.exports = router;
