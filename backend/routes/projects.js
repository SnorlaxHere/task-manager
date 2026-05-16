const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: check if user is member of project
const getMemberRole = (project, userId) => {
  const m = project.members.find(m => {
    const id = m.user._id ? m.user._id : m.user;
    return id.toString() === userId.toString();
  });
  return m ? m.role : null;
};

// @GET /api/projects
router.get('/', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('createdBy', 'firstName lastName email avatarUrl')
      .populate('members.user', 'firstName lastName email avatarUrl')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) { next(err); }
});

// @POST /api/projects
router.post('/', protect, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 chars'),
  body('description').optional().isLength({ max: 500 }),
  body('status').optional().isIn(['active', 'completed', 'on_hold']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, status, startDate, endDate } = req.body;
    const project = await Project.create({
      name, description, status, startDate, endDate,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });
    await project.populate('createdBy', 'firstName lastName email avatarUrl');
    await project.populate('members.user', 'firstName lastName email avatarUrl');
    res.status(201).json(project);
  } catch (err) { next(err); }
});

// @GET /api/projects/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email avatarUrl')
      .populate('members.user', 'firstName lastName email avatarUrl');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!getMemberRole(project, req.user._id)) return res.status(403).json({ message: 'Not a project member' });
    res.json(project);
  } catch (err) { next(err); }
});

// @PUT /api/projects/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (getMemberRole(project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { name, description, status, startDate, endDate } = req.body;
    Object.assign(project, { name, description, status, startDate, endDate });
    await project.save();
    await project.populate('createdBy', 'firstName lastName email avatarUrl');
    await project.populate('members.user', 'firstName lastName email avatarUrl');
    res.json(project);
  } catch (err) { next(err); }
});

// @DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (getMemberRole(project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
});

// @GET /api/projects/:id/members
router.get('/:id/members', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'firstName lastName email avatarUrl');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!getMemberRole(project, req.user._id)) return res.status(403).json({ message: 'Not a project member' });
    res.json(project.members);
  } catch (err) { next(err); }
});

// @POST /api/projects/:id/members
router.post('/:id/members', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (getMemberRole(project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { userId, role = 'member' } = req.body;
    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User already a member' });

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('members.user', 'firstName lastName email avatarUrl');
    res.json(project.members);
  } catch (err) { next(err); }
});

// @DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (getMemberRole(project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
});

// @PUT /api/projects/:id/members/:userId/role
router.put('/:id/members/:userId/role', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (getMemberRole(project, req.user._id) !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    member.role = req.body.role;
    await project.save();
    res.json({ message: 'Role updated' });
  } catch (err) { next(err); }
});

module.exports = router;
