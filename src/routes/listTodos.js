const router = require('express').Router({ mergeParams: true });
const requireAuth = require('../middleware/auth');
const { loadList, requireRead, requireOwner } = require('../middleware/listAccess');
const Todo = require('../models/Todo');


router.get('/lists/:listId/todos', requireAuth, loadList, requireRead, async (req, res) => {
  const items = await Todo.find({ list: req.list.id }).sort({ createdAt: -1 });
  res.json(items);
});


router.post('/lists/:listId/todos', requireAuth, loadList, requireOwner, async (req, res) => {
  const todo = await Todo.create({
    list: req.list.id,
    userId: req.userId,
    title: req.body.title,
    completed: false
  });
  res.status(201).json(todo);
});


router.put('/lists/:listId/todos/:todoId', requireAuth, loadList, requireOwner, async (req, res) => {
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.todoId, list: req.list.id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Todo not found' });
  res.json(updated);
});

router.delete('/lists/:listId/todos/:todoId', requireAuth, loadList, requireOwner, async (req, res) => {
  const del = await Todo.findOneAndDelete({ _id: req.params.todoId, list: req.list.id });
  if (!del) return res.status(404).json({ error: 'Todo not found' });
  res.json({ ok: true });
});

module.exports = router;
