const router = require('express').Router();
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateLogin } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'queuewise-secret-key-change-in-production';

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { username, password, rollNo } = req.body;
    const identifier = (rollNo || username || '').trim();
    const db = require('../utils/db');
    let authenticatedUser = null;

    // 1. Check if login is by a Student (Roll Number)
    const inMemoryStore = db.inMemoryStore;
    const student = inMemoryStore.students?.find(
      s => s.rollNo.toLowerCase() === identifier.toLowerCase() || s.name.toLowerCase() === identifier.toLowerCase()
    );

    if (student) {
      const isMatch = student.passwordHash
        ? await bcrypt.compare(password, student.passwordHash).catch(() => false)
        : (password === 'student123' || password === student.rollNo.toLowerCase());
      if (isMatch) {
        authenticatedUser = {
          id: student._id,
          rollNo: student.rollNo,
          name: student.name,
          department: student.department,
          phone: student.phone,
          role: 'student'
        };
      }
    }

    // 2. Allow custom student roll number format with demo password "student123"
    if (!authenticatedUser && (/^[0-9]{2}[a-zA-Z]{2,4}[0-9]{2,4}$/i.test(identifier) || identifier.toLowerCase().startsWith('22') || identifier.toLowerCase().startsWith('23') || identifier.toLowerCase().startsWith('24')) && password === 'student123') {
      authenticatedUser = {
        id: `student-${identifier}`,
        rollNo: identifier.toUpperCase(),
        name: `Student (${identifier.toUpperCase()})`,
        role: 'student'
      };
    }

    // 3. Check Staff & Admin login
    if (!authenticatedUser) {
      if (db.isDbConnected) {
        const staff = await Staff.findOne({ username: identifier });
        if (staff) {
          const isMatch = await bcrypt.compare(password, staff.password);
          if (isMatch) {
            authenticatedUser = {
              id: staff._id,
              username: staff.username,
              name: staff.name,
              role: staff.role,
              counterNumber: staff.counterNumber
            };
          }
        }
      } else {
        // In-memory fallback staff authentication
        const member = inMemoryStore.staff.find(s => s.username === identifier);
        if (member) {
          const isMatch = await bcrypt.compare(password, member.passwordHash).catch(() => false);
          if (isMatch) {
            authenticatedUser = {
              id: member._id,
              username: member.username,
              name: member.name,
              role: member.role,
              counterNumber: member.counterNumber
            };
          }
        }
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your Roll No / Username and Password.' });
    }

    const token = jwt.sign(authenticatedUser, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: authenticatedUser
    });
  } catch (err) {
    next(err);
  }
});

// Student Registration / Sign-Up Endpoint
router.post('/register', async (req, res, next) => {
  try {
    const { name, rollNo, department, phone, password } = req.body;
    if (!name || !rollNo || !password) {
      return res.status(400).json({ error: 'Full Name, Roll Number, and Password are required.' });
    }

    const formattedRoll = rollNo.trim().toUpperCase();
    const db = require('../utils/db');
    const inMemoryStore = db.inMemoryStore;

    // Check if student already exists
    const existing = inMemoryStore.students?.find(s => s.rollNo.toUpperCase() === formattedRoll);
    if (existing) {
      return res.status(409).json({ error: `Student with Roll Number ${formattedRoll} is already registered. Please sign in.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newStudent = {
      _id: `student-${Date.now()}`,
      rollNo: formattedRoll,
      passwordHash,
      name: name.trim(),
      department: department || 'General Engineering',
      phone: phone || '',
      role: 'student'
    };

    if (!inMemoryStore.students) inMemoryStore.students = [];
    inMemoryStore.students.push(newStudent);

    const token = jwt.sign(newStudent, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Student account registered successfully!',
      token,
      user: newStudent
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;
