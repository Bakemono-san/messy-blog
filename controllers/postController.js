const postService = require('../services/postService');

function ok(res, data) {
  return res.status(200).json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function notFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

async function createPost(req, res) {
  const { title, content, author } = req.body || {};
  if (!title || !content || !author) return badRequest(res, 'title, content and author are required');
  const post = postService.createPost({ title, content, author });
  return created(res, post);
}

async function listPosts(req, res) {
  const posts = postService.listPosts();
  return ok(res, posts);
}

async function getPost(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return badRequest(res, 'invalid id');
  const post = postService.findPostById(id);
  if (!post) return notFound(res, 'Post not found');
  return ok(res, post);
}

async function putPost(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return badRequest(res, 'invalid id');
  const { title, content, author } = req.body || {};
  if (!author) return badRequest(res, 'author is required');

  const post = postService.findPostById(id, { includeDeleted: true });
  if (!post) return notFound(res, 'Post not found');

  if (author !== post.author) {
    const pending = postService.upsertPendingEdit(id, { title, content, updatedBy: author });
    return ok(res, { message: 'Post edited and is waiting for author approval', pending });
  }

  const updated = postService.updatePostByAuthor(id, { title, content });
  return ok(res, updated);
}

async function validateEdit(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return badRequest(res, 'invalid id');
  const { author } = req.body || {};
  if (!author) return badRequest(res, 'author is required');

  const original = postService.findPostById(id, { includeDeleted: true });
  if (!original) return notFound(res, 'Post not found');

  if (original.author !== author) return forbidden(res, 'Only the original author can approve edits');

  const pending = postService.getPendingEdit(id);
  if (!pending) return notFound(res, 'No edited post found for this ID');

  const applied = postService.approvePendingEdit(id, author);
  return ok(res, applied);
}

async function deletePost(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return badRequest(res, 'invalid id');
  const { author } = req.body || {};
  if (!author) return badRequest(res, 'author is required');

  const post = postService.findPostById(id, { includeDeleted: true });
  if (!post) return notFound(res, 'Post not found');
  if (post.author !== author) return forbidden(res, 'Only the author can delete this post');

  const deleted = postService.deletePost(id);
  return ok(res, deleted);
}

module.exports = {
  createPost,
  listPosts,
  getPost,
  putPost,
  validateEdit,
  deletePost,
};
