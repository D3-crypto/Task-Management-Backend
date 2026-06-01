require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Tasks'); 


const users = [
 
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Password123',
    role: 'admin'
  },
    
  {
    name: 'Sarah Manager',
    email: 'manager1@example.com',
    password: 'Password123',
    role: 'manager'
  },
  {
    name: 'David Director',
    email: 'manager2@example.com',
    password: 'Password123',
    role: 'manager'
  },
    
  {
    name: 'Alice Employee',
    email: 'employee1@example.com',
    password: 'Password123',
    role: 'employee'
  },
  {
    name: 'Bob Developer',
    email: 'employee2@example.com',
    password: 'Password123',
    role: 'employee'
  },
  {
    name: 'Charlie Tester',
    email: 'employee3@example.com',
    password: 'Password123',
    role: 'employee'
  },
  {
    name: 'Diana Designer',
    email: 'employee4@example.com',
    password: 'Password123',
    role: 'employee'
  },
  {
    name: 'Evan Analyst',
    email: 'employee5@example.com',
    password: 'Password123',
    role: 'employee'
  }
];

const seedData = async () => {
  try {
        
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    await Task.deleteMany();
    await User.deleteMany();
    console.log('Database wiped clean!');

    
    const createdUsers = await User.create(users);
    console.log(`Successfully created ${createdUsers.length} users!`);

 
    const managers = createdUsers.filter(u => u.role === 'manager');
    const employees = createdUsers.filter(u => u.role === 'employee');

   
    const tasks = [
      {
        title: 'Design System Architecture',
        description: 'Draft the MERN system architecture and database entity diagrams.',
        priority: 'High',
        status: 'In Progress',
        assignedEmployee: employees[0]._id, 
        createdBy: managers[0]._id, 
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Setup API Gateway and Security',
        description: 'Implement JWT, Helmet headers, CORS policies, and rate limits.',
        priority: 'High',
        status: 'Pending',
        assignedEmployee: employees[1]._id, 
        createdBy: managers[0]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Write User Authentication Tests',
        description: 'Write integration test cases for Login and Token validation endpoints.',
        priority: 'Medium',
        status: 'Pending',
        assignedEmployee: employees[2]._id, 
        createdBy: managers[0]._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'UI Design for Dashboard Pages',
        description: 'Design interactive wireframes and mockups for role-based views.',
        priority: 'Medium',
        status: 'Completed',
        assignedEmployee: employees[3]._id, 
        createdBy: managers[1]._id, 
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Database Schema Indexing Optimization',
        description: 'Implement indexes on foreign reference keys and sorting fields.',
        priority: 'Low',
        status: 'Completed',
        assignedEmployee: employees[4]._id, 
        createdBy: managers[1]._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Deploy API to Staging Environment',
        description: 'Configure CI/CD pipelines to deploy backend service to cloud host.',
        priority: 'High',
        status: 'Pending',
        assignedEmployee: employees[1]._id, 
        createdBy: managers[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Create User Documentation',
        description: 'Write developer setup instructions and API spec documentation.',
        priority: 'Low',
        status: 'In Progress',
        assignedEmployee: employees[0]._id, 
        createdBy: managers[1]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdTasks = await Task.create(tasks);
    console.log(`Successfully created ${createdTasks.length} tasks!`);

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
