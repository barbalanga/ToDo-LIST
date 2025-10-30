const List = require('../models/list');

async function loadList(req, res, next) {
  const listId = req.params.listId || req.params.id;
  const list = await List.findById(listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  req.list = list;
  next();
}

function getPermission(userId, listDoc) {
  const isOwner = listDoc.owner.toString() === userId.toString();
  if (isOwner) return 'owner';
  const isViewer = listDoc.members.some(m => m.user.toString() === userId.toString());
  if (isViewer) return 'viewer';
  return 'none';
}

function requireRead(req, res, next) {
  const perm = getPermission(req.userId, req.list);
  if (perm === 'none') return res.status(403).json({ error: 'Forbidden' });
  next();
}

function requireOwner(req, res, next) {
  const perm = getPermission(req.userId, req.list);
  if (perm !== 'owner') return res.status(403).json({ error: 'Owners only' });
  next();
}

module.exports = { loadList, requireRead, requireOwner };
