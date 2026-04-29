const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc  Create task
// @route POST /api/tasks
// @access Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// @desc  Get tasks (with filters)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members can only see their own tasks
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc  Get tasks for a project
// @route GET /api/tasks/project/:projectId
// @access Private
const getProjectTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = { projectId: req.params.projectId };
    if (status) filter.status = status;

    // Members only see their tasks in the project
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only view their own tasks
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc  Update task (Admin full update, Member status only)
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update everything
      Object.assign(task, req.body);
    } else {
      // Member can only update status of their own task
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      if (req.body.status) {
        task.status = req.body.status;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');
    await task.populate('createdBy', 'name email');

    res.json({ success: true, message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
// @access Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
