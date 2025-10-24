const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateDetails,
  updatePassword,
  getDashboard
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router
  .route('/me')
  .get(protect, getMe);

router
  .route('/updatedetails')
  .put(protect, updateDetails);

router
  .route('/updatepassword')
  .put(protect, updatePassword);

router
  .route('/dashboard')
  .get(protect, getDashboard);

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;