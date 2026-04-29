const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc  Get dashboard stats
// @route GET /api/dashboard
// @access Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = req.user._id;
    }

    const [
      totalTasks, todoTasks, inProgressTasks, completedTasks, overdueTasks,
      totalProjects, totalUsers, recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'To Do' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      req.user.role === 'admin' ? Project.countDocuments() : Project.countDocuments({ teamMembers: req.user._id }),
      req.user.role === 'admin' ? User.countDocuments() : null,
      Task.find(taskFilter).sort({ updatedAt: -1 }).limit(8)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name'),
    ]);

    // Tasks by project (for bar chart)
    const projectStats = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$projectId', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: '$project.title', count: 1, completed: 1 } },
      { $limit: 6 },
    ]);

    // Weekly task completion (last 7 days)
    const weeklyData = await Task.aggregate([
      { $match: { ...taskFilter, updatedAt: { $gte: sevenDaysAgo }, status: 'Completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build full 7-day series (fill missing days with 0)
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = weeklyData.find(w => w._id === key);
      weeklyChart.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: key,
        completed: found?.completed || 0,
      });
    }

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = await Task.find({
      ...taskFilter,
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .populate('projectId', 'title');

    // Activity feed (recent task updates)
    const activityFeed = await Task.find(taskFilter)
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('assignedTo', 'name')
      .populate('projectId', 'title')
      .populate('createdBy', 'name')
      .select('title status updatedAt assignedTo projectId createdBy priority');

    res.json({
      success: true,
      stats: {
        totalTasks, todoTasks, inProgressTasks, completedTasks,
        overdueTasks, totalProjects, totalUsers,
        recentTasks, projectStats,
        weeklyChart,
        upcomingDeadlines,
        activityFeed,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
