const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('status')
      .optional()
      .isIn(['To Do', 'In Progress', 'Completed'])
      .withMessage('Invalid status'),
  ],
  validate,
  createTask
);

router.get('/project/:projectId', getProjectTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
