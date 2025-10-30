const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

router.post('/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'email & password required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '1d',
    });

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Bad credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Bad credentials' });

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: '1d',
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
