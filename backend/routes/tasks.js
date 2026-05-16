const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getMemberRole = (project, userId) => {
  const m = project.members.find(m => {
    const id = m.user._id ? m.user._id : m.user;
    return id.toString() === userId.toString();
  });
  return m ? m.role : null;
};

// @GET /api/tasks  (filter by project, status, priority, assignee)
router.get('/', protect, async (req, res, next) => {
  try {
    const { project, status, priority, assignee } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName avatarUrl')
      .populate('assignees', 'firstName lastName avatarUrl email')
      .sort('-createdAt');
    res.json(tasks);
  } catch (err) { next(err); }
});

// @POST /api/tasks
router.post('/', protect, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 chars'),
  body('project').notEmpty().withMessage('Project ID required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, project: projectId, status, priority, estimatedHours, dueDate, assignees } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!getMemberRole(project, req.user._id)) return res.status(403).json({ message: 'Not a project member' });

    const task = await Task.create({
      title, description, project: projectId, status, priority,
      estimatedHours, dueDate, assignees: assignees || [],
      createdBy: req.user._id,
    });
    await task.populate('project', 'name');
    await task.populate('createdBy', 'firstName lastName avatarUrl');
    await task.populate('assignees', 'firstName lastName avatarUrl email');
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// @GET /api/tasks/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name members')
      .populate('createdBy', 'firstName lastName avatarUrl')
      .populate('assignees', 'firstName lastName avatarUrl email')
      .populate('history.changedBy', 'firstName lastName avatarUrl');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

// @PUT /api/tasks/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = getMemberRole(task.project, req.user._id);
    const isAssignee = task.assignees.some(a => a.toString() === req.user._id.toString());
    if (!role && !isAssignee) return res.status(403).json({ message: 'Not authorized' });
    if (role !== 'admin' && !isAssignee) return res.status(403).json({ message: 'Only admin or assignee can update' });

    const fields = ['title', 'description', 'priority', 'estimatedHours', 'dueDate', 'progress', 'assignees'];
    const historyEntries = [];

    fields.forEach(field => {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(task[field])) {
        historyEntries.push({ changedBy: req.user._id, fieldName: field, oldValue: String(task[field]), newValue: String(req.body[field]) });
        task[field] = req.body[field];
      }
    });

    if (task.progress === 100 && task.status !== 'completed') {
      historyEntries.push({ changedBy: req.user._id, fieldName: 'status', oldValue: task.status, newValue: 'completed' });
      task.status = 'completed';
    } else if (task.progress < 100 && task.status === 'completed') {
      historyEntries.push({ changedBy: req.user._id, fieldName: 'status', oldValue: task.status, newValue: 'in_progress' });
      task.status = 'in_progress';
    }

    if (historyEntries.length > 0) task.history.push(...historyEntries);
    await task.save();
    await task.populate('project', 'name');
    await task.populate('createdBy', 'firstName lastName avatarUrl');
    await task.populate('assignees', 'firstName lastName avatarUrl email');
    res.json(task);
  } catch (err) { next(err); }
});

// @DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (getMemberRole(task.project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
});

// @PATCH /api/tasks/:id/status
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = getMemberRole(task.project, req.user._id);
    const isAssignee = task.assignees.some(a => a.toString() === req.user._id.toString());
    if (role !== 'admin' && !isAssignee) return res.status(403).json({ message: 'Not authorized' });

    const { status } = req.body;
    const validStatuses = ['todo', 'in_progress', 'review', 'completed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    task.history.push({ changedBy: req.user._id, fieldName: 'status', oldValue: task.status, newValue: status });
    task.status = status;
    if (status === 'completed') task.progress = 100;
    await task.save();
    res.json(task);
  } catch (err) { next(err); }
});

// @POST /api/tasks/:id/assign
router.post('/:id/assign', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (getMemberRole(task.project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { userId } = req.body;
    if (!task.assignees.includes(userId)) task.assignees.push(userId);
    await task.save();
    await task.populate('assignees', 'firstName lastName avatarUrl email');
    res.json(task.assignees);
  } catch (err) { next(err); }
});

// @DELETE /api/tasks/:id/assign/:userId
router.delete('/:id/assign/:userId', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (getMemberRole(task.project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    task.assignees = task.assignees.filter(a => a.toString() !== req.params.userId);
    await task.save();
    res.json({ message: 'Assignee removed' });
  } catch (err) { next(err); }
});

// @GET /api/tasks/:id/history
router.get('/:id/history', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('history.changedBy', 'firstName lastName avatarUrl');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task.history);
  } catch (err) { next(err); }
});

module.exports = router;
