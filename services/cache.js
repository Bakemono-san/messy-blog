const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

function get(key) {
  return cache.get(key);
}

function set(key, value, ttl) {
  return cache.set(key, value, ttl);
}

function del(key) {
  return cache.del(key);
}

function flush() {
  return cache.flushAll();
}

module.exports = { get, set, del, flush };
