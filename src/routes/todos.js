const router = require('express').Router();
const Todo = require('../models/Todo');
const requireAuth = require('../middleware/auth'); 
const { loadList, requireRead, requireOwner } = require('../middleware/listAccess');


router.get('/', async (req, res) => {
  const items = await Todo.find({ userId: req.userId, list: null }).sort({ createdAt: -1 });
  res.json(items);
});


router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'title required' });
  const t = await Todo.create({ userId: req.userId, title: title.trim(), completed: false, list: null });
  res.status(201).json(t);
});


router.put('/:id', async (req, res) => {
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId, list: null },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});


router.delete('/:id', async (req, res) => {
  await Todo.deleteOne({ _id: req.params.id, userId: req.userId, list: null });
  res.json({ ok: true });
});


router.delete('/', async (req, res) => {
  await Todo.deleteMany({ userId: req.userId, list: null });
  res.json({ ok: true });
});
router.delete('/lists/:listId/todos', requireAuth, loadList, requireOwner, async (req, res) => {
  await Todo.deleteMany({ list: req.list.id });
  res.json({ ok: true });
});

module.exports = router;
