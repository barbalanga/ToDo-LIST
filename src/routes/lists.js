const router = require('express').Router();
const auth = require('../middleware/auth');
const { loadList, requireOwner, requireRead } = require('../middleware/listAccess');
const User = require('../models/User');
const List = require('../models/list');

router.get('/', auth, async (req, res) => {
  const rows = await List.find({
    $or: [{ owner: req.userId }, { 'members.user': req.userId }]
  })
    .populate('owner', 'email')
    .populate('members.user', 'email')
    .lean();

  const data = rows.map(r => {
    const ownerId = (r.owner._id || r.owner).toString();
    const iAmOwner = ownerId === req.userId.toString();

    return {
      _id: r._id.toString(),
      name: r.name,
      owner: ownerId,
      ownerEmail: r.owner.email || '',
      canWrite: iAmOwner,
      members: iAmOwner
        ? (r.members || []).map(m => ({
            user: (m.user._id || m.user).toString(),
            email: (m.user.email || m.email || '')
          }))
        : []
    };
  });

  res.json(data);
});

router.post('/', auth, async (req, res) => {
  const list = await List.create({ name: req.body.name || 'New list', owner: req.userId, members: [] });
  const owner = await User.findById(req.userId).lean();
  res.json({
    _id: list._id.toString(),
    name: list.name,
    owner: req.userId.toString(),
    ownerEmail: owner?.email || '',
    canWrite: true,
    members: []
  });
});

router.post('/:id/share', auth, loadList, requireOwner, async (req, res) => {
  const raw = (req.body.email || '').trim().toLowerCase();
  if (!raw) return res.status(400).json({ error: 'Email required' });

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(raw)) return res.status(400).json({ error: 'Invalid email address' });

  const owner = await User.findById(req.list.owner).lean();
  if (owner && owner.email && owner.email.toLowerCase() === raw) {
    return res.status(400).json({ error: 'Cannot share with yourself' });
  }

  const user = await User.findOne({ email: raw });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exists = req.list.members.some(m => (m.user._id || m.user).toString() === user.id);
  if (exists) return res.status(400).json({ error: 'User already has access' });

  req.list.members.push({ user: user.id, role: 'viewer', email: raw });
  await req.list.save();
  res.json({ ok: true });
});

router.delete('/:id/share/:memberId', auth, loadList, requireOwner, async (req, res) => {
  req.list.members = req.list.members.filter(m => (m.user._id || m.user).toString() !== req.params.memberId);
  await req.list.save();
  res.json({ ok: true });
});

router.delete('/:id/leave', auth, loadList, requireRead, async (req, res) => {
  if (req.list.owner.toString() === req.userId.toString()) return res.status(400).json({ error: 'Owner cannot leave' });
  const before = req.list.members.length;
  req.list.members = req.list.members.filter(m => (m.user._id || m.user).toString() !== req.userId.toString());
  if (req.list.members.length === before) return res.status(404).json({ error: 'Not a member' });
  await req.list.save();
  res.json({ ok: true });
});

router.delete('/:id', auth, loadList, requireOwner, async (req, res) => {
  await List.deleteOne({ _id: req.list._id });
  res.json({ ok: true });
});

module.exports = router;
