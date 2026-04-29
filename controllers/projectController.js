const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc  Create project
// @route POST /api/projects
// @access Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, teamMembers, status } = req.body;
    const project = await Project.create({
      title,
      description,
      teamMembers: teamMembers || [],
      status,
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role');

    res.status(201).json({ success: true, message: 'Project created', project });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all projects
// @route GET /api/projects
// @access Private
const getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      // Members can only see projects they're part of
      query = Project.find({ teamMembers: req.user._id });
    }

    const projects = await query
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 });

    // Get task counts per project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        const completedCount = await Task.countDocuments({
          projectId: project._id,
          status: 'Completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json({ success: true, count: projects.length, projects: projectsWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single project
// @route GET /api/projects/:id
// @access Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Members can only see their projects
    if (
      req.user.role !== 'admin' &&
      !project.teamMembers.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc  Update project
// @route PUT /api/projects/:id
// @access Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete project
// @route DELETE /api/projects/:id
// @access Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks for this project
    await Task.deleteMany({ projectId: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add/remove team member
// @route PATCH /api/projects/:id/members
// @access Private/Admin
const updateTeamMembers = async (req, res, next) => {
  try {
    const { userId, action } = req.body; // action: 'add' | 'remove'

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (action === 'add') {
      if (!project.teamMembers.includes(userId)) {
        project.teamMembers.push(userId);
      }
    } else if (action === 'remove') {
      project.teamMembers = project.teamMembers.filter((m) => m.toString() !== userId);
    }

    await project.save();
    await project.populate('teamMembers', 'name email role');
    await project.populate('createdBy', 'name email');

    res.json({ success: true, message: `Member ${action}ed successfully`, project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateTeamMembers,
};
