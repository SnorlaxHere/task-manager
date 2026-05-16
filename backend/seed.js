require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({
    firstName: 'Alice', lastName: 'Admin',
    email: 'alice@example.com', password: 'Admin123',
    role: 'admin',
  });
  const bob = await User.create({
    firstName: 'Bob', lastName: 'Builder',
    email: 'bob@example.com', password: 'Member123',
    role: 'member',
  });
  const carol = await User.create({
    firstName: 'Carol', lastName: 'Dev',
    email: 'carol@example.com', password: 'Member123',
    role: 'member',
  });
  console.log('Created users');

  // Create projects
  const project1 = await Project.create({
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design.',
    status: 'active',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-06-30'),
    createdBy: admin._id,
    members: [
      { user: admin._id, role: 'admin' },
      { user: bob._id, role: 'member' },
      { user: carol._id, role: 'member' },
    ],
  });
  const project2 = await Project.create({
    name: 'Mobile App MVP',
    description: 'Build the first version of the mobile application.',
    status: 'active',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-08-31'),
    createdBy: admin._id,
    members: [
      { user: admin._id, role: 'admin' },
      { user: carol._id, role: 'member' },
    ],
  });
  console.log('Created projects');

  // Create tasks
  const tasks = [
    { title: 'Design new homepage layout', project: project1._id, status: 'completed', priority: 'high', progress: 100, assignees: [bob._id], createdBy: admin._id, dueDate: new Date('2026-03-01') },
    { title: 'Implement responsive navigation', project: project1._id, status: 'in_progress', priority: 'high', progress: 60, assignees: [carol._id], createdBy: admin._id, dueDate: new Date('2026-05-20') },
    { title: 'Write API documentation', project: project1._id, status: 'todo', priority: 'medium', progress: 0, assignees: [bob._id], createdBy: admin._id, dueDate: new Date('2026-06-15') },
    { title: 'Setup CI/CD pipeline', project: project1._id, status: 'review', priority: 'medium', progress: 80, assignees: [carol._id], createdBy: admin._id, dueDate: new Date('2026-05-25') },
    { title: 'Design app wireframes', project: project2._id, status: 'completed', priority: 'high', progress: 100, assignees: [carol._id], createdBy: admin._id, dueDate: new Date('2026-03-15') },
    { title: 'Build authentication flow', project: project2._id, status: 'in_progress', priority: 'high', progress: 45, assignees: [carol._id], createdBy: admin._id, dueDate: new Date('2026-05-30') },
    { title: 'Integrate push notifications', project: project2._id, status: 'todo', priority: 'low', progress: 0, assignees: [carol._id], createdBy: admin._id, dueDate: new Date('2026-07-31') },
    { title: 'Overdue task example', project: project1._id, status: 'in_progress', priority: 'high', progress: 30, assignees: [bob._id], createdBy: admin._id, dueDate: new Date('2026-04-01') },
  ];
  await Task.insertMany(tasks);
  console.log('Created tasks');

  console.log('\n✅ Seed complete!');
  console.log('Test credentials:');
  console.log('  Admin  → alice@example.com / Admin123');
  console.log('  Member → bob@example.com   / Member123');
  console.log('  Member → carol@example.com / Member123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
