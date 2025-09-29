const posts = [];
const editedPosts = [];
let nextId = 1;

const cache = require('./cache');
const POSTS_LIST_CACHE_KEY = 'posts:list';
function invalidateCachesForPost(id) {
  cache.del(POSTS_LIST_CACHE_KEY);
  cache.del(`post:${id}`);
}

const logger = require('../lib/logger');

function createPost({ title, content, author }) {
  const post = {
    id: nextId++,
    title,
    content,
    author,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
  };
  posts.push(post);
  invalidateCachesForPost(post.id);
  logger.info('Post created: %d by %s', post.id, post.author);
  return post;
}

function listPosts({ includeDeleted = false } = {}) {
  if (includeDeleted) return posts.slice();

  const cached = cache.get(POSTS_LIST_CACHE_KEY);
  if (cached) return cached;

  const result = posts.filter((p) => p.deletedAt == null);
  cache.set(POSTS_LIST_CACHE_KEY, result, 30);
  return result;
}

function findPostById(id, { includeDeleted = false } = {}) {
  if (!includeDeleted) {
    const cached = cache.get(`post:${id}`);
    if (cached) return cached;
  }

  const p = posts.find((x) => x.id === id);
  if (!p) return null;
  if (!includeDeleted && p.deletedAt != null) return null;

  if (!includeDeleted) cache.set(`post:${id}`, p, 30);
  return p;
}

function upsertPendingEdit(id, { title, content, updatedBy }) {
  const original = posts.find((p) => p.id === id);
  if (!original) return null;

  const edited = {
    ...original,
    title: typeof title === 'string' ? title : original.title,
    content: typeof content === 'string' ? content : original.content,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };

  const idx = editedPosts.findIndex((e) => e.id === id);
  if (idx === -1) editedPosts.push(edited);
  else editedPosts[idx] = edited;

  logger.info('Pending edit upserted for post %d by %s', id, updatedBy);
  return edited;
}

function getPendingEdit(id) {
  return editedPosts.find((e) => e.id === id) || null;
}

function approvePendingEdit(id, approver) {
  const postIndex = posts.findIndex((p) => p.id === id);
  const editedIndex = editedPosts.findIndex((e) => e.id === id);
  if (postIndex === -1 || editedIndex === -1) return null;

  const post = editedPosts[editedIndex];
  post.updatedAt = new Date().toISOString();
  posts[postIndex] = { ...post };
  editedPosts.splice(editedIndex, 1);
  invalidateCachesForPost(id);
  logger.info('Pending edit approved for post %d by %s', id, approver);
  return posts[postIndex];
}

function updatePostByAuthor(id, { title, content }) {
  const p = posts.find((x) => x.id === id);
  if (!p) return null;
  p.title = typeof title === 'string' && title.trim() ? title : p.title;
  p.content = typeof content === 'string' && content.trim() ? content : p.content;
  p.updatedAt = new Date().toISOString();
  invalidateCachesForPost(id);
  logger.info('Post %d updated by author', id);
  return p;
}

function deletePost(id) {
  const p = posts.find((x) => x.id === id);
  if (!p) return null;
  p.deletedAt = new Date().toISOString();
  const idx = editedPosts.findIndex((e) => e.id === id);
  if (idx !== -1) editedPosts.splice(idx, 1);
  invalidateCachesForPost(id);
  logger.info('Post %d deleted', id);
  return p;
}

module.exports = {
  createPost,
  listPosts,
  findPostById,
  upsertPendingEdit,
  getPendingEdit,
  approvePendingEdit,
  updatePostByAuthor,
  deletePost,
};
