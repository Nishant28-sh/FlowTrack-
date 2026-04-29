const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        name: 'Nishant Kumar',
        email: 'nishant@flowtrack.com',
        password: 'Admin@123',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nishant',
      },
      {
        name: 'Priya Singh',
        email: 'priya@flowtrack.com',
        password: 'Member@123',
        role: 'member',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      },
      {
        name: 'Rajesh Patel',
        email: 'rajesh@flowtrack.com',
        password: 'Member@123',
        role: 'member',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@flowtrack.com',
        password: 'Member@123',
        role: 'member',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
      },
      {
        name: 'Vikram Desai',
        email: 'vikram@flowtrack.com',
        password: 'Member@123',
        role: 'member',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Projects
    const projects = await Project.create([
      {
        title: 'Mobile App Redesign',
        description: 'Complete redesign of the mobile application with modern UI/UX principles and improved performance',
        createdBy: users[0]._id,
        teamMembers: [users[1]._id, users[2]._id, users[3]._id],
        status: 'active',
      },
      {
        title: 'Backend API Migration',
        description: 'Migrate legacy REST APIs to GraphQL for better performance and reduced bandwidth usage',
        createdBy: users[0]._id,
        teamMembers: [users[2]._id, users[4]._id],
        status: 'active',
      },
      {
        title: 'Database Optimization',
        description: 'Optimize database queries and implement caching strategies to improve response times',
        createdBy: users[0]._id,
        teamMembers: [users[4]._id, users[1]._id],
        status: 'active',
      },
      {
        title: 'Security Audit',
        description: 'Comprehensive security audit and implementation of security best practices',
        createdBy: users[0]._id,
        teamMembers: [users[2]._id, users[3]._id, users[4]._id],
        status: 'completed',
      },
    ]);
    console.log(`✅ Created ${projects.length} projects`);

    // Create Tasks
    const tasks = await Task.create([
      // Project 1 Tasks
      {
        title: 'Design Wireframes',
        description: 'Create wireframes for all app pages including login, dashboard, and settings',
        projectId: projects[0]._id,
        assignedTo: users[1]._id,
        createdBy: users[0]._id,
        status: 'Completed',
        priority: 'high',
        dueDate: new Date('2026-05-10'),
      },
      {
        title: 'Frontend Component Development',
        description: 'Build reusable React components for UI elements',
        projectId: projects[0]._id,
        assignedTo: users[2]._id,
        createdBy: users[0]._id,
        status: 'In Progress',
        priority: 'high',
        dueDate: new Date('2026-05-20'),
      },
      {
        title: 'User Testing & Feedback',
        description: 'Conduct user testing sessions and collect feedback on design',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[0]._id,
        status: 'To Do',
        priority: 'medium',
        dueDate: new Date('2026-05-25'),
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize bundle size and improve initial load time below 2 seconds',
        projectId: projects[0]._id,
        assignedTo: users[1]._id,
        createdBy: users[0]._id,
        status: 'To Do',
        priority: 'medium',
        dueDate: new Date('2026-06-01'),
      },

      // Project 2 Tasks
      {
        title: 'GraphQL Schema Design',
        description: 'Design comprehensive GraphQL schema for all API endpoints',
        projectId: projects[1]._id,
        assignedTo: users[2]._id,
        createdBy: users[0]._id,
        status: 'In Progress',
        priority: 'high',
        dueDate: new Date('2026-05-15'),
      },
      {
        title: 'Create Apollo Server Setup',
        description: 'Set up Apollo Server with authentication middleware',
        projectId: projects[1]._id,
        assignedTo: users[4]._id,
        createdBy: users[0]._id,
        status: 'To Do',
        priority: 'high',
        dueDate: new Date('2026-05-18'),
      },
      {
        title: 'API Testing & Validation',
        description: 'Write comprehensive tests for all GraphQL resolvers',
        projectId: projects[1]._id,
        assignedTo: users[2]._id,
        createdBy: users[0]._id,
        status: 'To Do',
        priority: 'medium',
        dueDate: new Date('2026-05-30'),
      },

      // Project 3 Tasks
      {
        title: 'Database Indexing',
        description: 'Add appropriate indexes to frequently queried fields',
        projectId: projects[2]._id,
        assignedTo: users[4]._id,
        createdBy: users[0]._id,
        status: 'Completed',
        priority: 'high',
        dueDate: new Date('2026-04-25'),
      },
      {
        title: 'Implement Redis Caching',
        description: 'Set up Redis for caching frequently accessed data',
        projectId: projects[2]._id,
        assignedTo: users[1]._id,
        createdBy: users[0]._id,
        status: 'In Progress',
        priority: 'high',
        dueDate: new Date('2026-05-22'),
      },
      {
        title: 'Query Optimization Analysis',
        description: 'Analyze and optimize slow database queries',
        projectId: projects[2]._id,
        assignedTo: users[4]._id,
        createdBy: users[0]._id,
        status: 'To Do',
        priority: 'medium',
        dueDate: new Date('2026-06-05'),
      },

      // Project 4 Tasks (Completed)
      {
        title: 'Security Vulnerability Scan',
        description: 'Perform automated security scanning and identify vulnerabilities',
        projectId: projects[3]._id,
        assignedTo: users[2]._id,
        createdBy: users[0]._id,
        status: 'Completed',
        priority: 'high',
        dueDate: new Date('2026-04-20'),
      },
      {
        title: 'Implement Security Patches',
        description: 'Apply security patches and fix identified vulnerabilities',
        projectId: projects[3]._id,
        assignedTo: users[3]._id,
        createdBy: users[0]._id,
        status: 'Completed',
        priority: 'high',
        dueDate: new Date('2026-04-25'),
      },
      {
        title: 'Security Documentation',
        description: 'Document all security measures and best practices',
        projectId: projects[3]._id,
        assignedTo: users[4]._id,
        createdBy: users[0]._id,
        status: 'Completed',
        priority: 'medium',
        dueDate: new Date('2026-04-28'),
      },
    ]);
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('\n📊 Database Seeded Successfully!\n');
    console.log('🔐 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Account:');
    console.log('  Email: nishant@flowtrack.com');
    console.log('  Password: Admin@123');
    console.log('\nMember Accounts:');
    console.log('  Email: priya@flowtrack.com (Password: Member@123)');
    console.log('  Email: rajesh@flowtrack.com (Password: Member@123)');
    console.log('  Email: aisha@flowtrack.com (Password: Member@123)');
    console.log('  Email: vikram@flowtrack.com (Password: Member@123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
