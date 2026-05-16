const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/dashboard/my-tasks
router.get('/my-tasks', protect, async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignees: req.user._id })
      .populate('project', 'name')
      .populate('assignees', 'firstName lastName avatarUrl')
      .sort('dueDate');
    res.json(tasks);
  } catch (err) { next(err); }
});

// @GET /api/dashboard/overdue
router.get('/overdue', protect, async (req, res, next) => {
  try {
    const tasks = await Task.find({
      assignees: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    }).populate('project', 'name').sort('dueDate');
    res.json(tasks);
  } catch (err) { next(err); }
});

// @GET /api/dashboard/stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [total, completed, inProgress, overdue] = await Promise.all([
      Task.countDocuments({ assignees: req.user._id }),
      Task.countDocuments({ assignees: req.user._id, status: 'completed' }),
      Task.countDocuments({ assignees: req.user._id, status: 'in_progress' }),
      Task.countDocuments({ assignees: req.user._id, dueDate: { $lt: new Date() }, status: { $ne: 'completed' } }),
    ]);
    const projects = await Project.countDocuments({ 'members.user': req.user._id });
    res.json({ total, completed, inProgress, overdue, projects });
  } catch (err) { next(err); }
});

// @GET /api/dashboard/project/:id/stats
router.get('/project/:id/stats', protect, async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length,
    };
    res.json(stats);
  } catch (err) { next(err); }
});

module.exports = router;
