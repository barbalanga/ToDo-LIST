function getPermission(userId, listDoc) {
  const isOwner = listDoc.owner.toString() === userId.toString();
  if (isOwner) return 'owner';
  const isViewer = listDoc.members.some(m => m.user.toString() === userId.toString());
  if (isViewer) return 'viewer';
  return 'none';
}

module.exports = { getPermission };
