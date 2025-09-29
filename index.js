const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 4000;
let posts = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('<h1>My Blog</h1>');
});

app.post('/post', (req, res) => {
  const { title, content, author } = req.body;
  if (title && content && author) {
    const post = { id: posts.length + 1, title, content, author };
    posts.push(post);
    res.send('Post added!');
  } else {
    res.send('Invalid input');
  }
});

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.get('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (post) {
    res.send(post);
  } else {
    res.send('Post not found');
  }
});

app.put('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const post = posts.find(p => p.id === id);
  if (post) {
    post.title = title || post.title;
    post.content = content || post.content;
    res.send('Post updated');
  } else {
    res.send('Post not found');
  }
});

app.delete('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  posts = posts.filter(p => p.id !== id);
  res.send('Post deleted if existed');
});

app.listen(PORT, () => {
  console.log('Blog app listening on port ' + PORT);
});