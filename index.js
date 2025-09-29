const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 4000;

/**
 * @typedef {{id:number , title: string , content:string,author: string, createdAt: string | Date , updatedAt: string| Date ,  deletedAt: string| Date , updatedBy: string}} post
 */

/**
 * @type {post[]}
 */
let posts = [];

let editedPosts = [];

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>My Blog</h1>");
});

app.post("/post", (req, res) => {
  /**
   * @type {{title:string, content:string, author:string}}
   *
   */
  const { title, content, author } = req.body;

  if (title.trim() && content.trim() && author.trim()) {
    /**
     * @type {post}
     */
    const post = {
      id: posts.length + 1,
      title,
      content,
      author,
      createdAt: Date.now().toLocaleString(),
      updatedAt: null,
      deletedAt: null,
    };

    posts.push(post);
    res.send("Post added!");
  } else {
    res.send("Invalid input");
  }
});

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.get("/post/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find((p) => p.id === id && p.deletedAt == null);
  if (post) {
    res.send(post);
  } else {
    res.send("Post not found");
  }
});

app.post("/validate-edit/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const {author} = req.body;
  const postIndex = posts.findIndex((p) => p.id === id);
  const editedPostIndex = editedPosts.findIndex((p) => p.id === id);

  if(posts[postIndex].author  != author){
    return res.send("It's not your post you can't approve it :)");
  }
  

  if (postIndex === -1) {
    return res.status(404).send("Post not found");
  }

  if (editedPostIndex === -1) {
    return res.status(404).send("No edited post found for this ID");
  }

  posts[postIndex] = { ...editedPosts[editedPostIndex] };
  editedPosts.splice(editedPostIndex, 1);

  res.send("Edit approved and applied to the original post");
});

app.put("/post/:id", (req, res) => {
  const { title, content, author } = req.body;
  const id = parseInt(req.params.id);

  const post = posts.find((p) => p.id === id);

  if (!post || author !== post.author) {
    if (post) {
      editedPosts.push({
        ...post,
        updatedBy: author,
        updatedAt: Date.now().toLocaleString(),
        title,
        content,
      });
    }

    return res.send("Post edited waiting for author approval");
  }

  if (post) {
    post.title = title || post.title;
    post.content = content || post.content;
    post.updatedAt = Date.now().toLocaleString();
    res.send("Post updated");
  } else {
    res.send("Post not found");
  }
});

app.delete("/post/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { author } = req.body;
  const post = posts.find((p) => p.id === id);

  if (!post || author !== post.author) {
    return res.send(
      "Your not the author , go there! or this post doesn't exist"
    );
  }
  post.deletedAt = Date.now().toLocaleString();

  res.send("Post deleted if existed");
});

app.listen(PORT, () => {
  console.log("Blog app listening on port " + PORT);
});
