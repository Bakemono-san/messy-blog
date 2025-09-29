const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router.get('/', controller.listPosts);
router.post('/', controller.createPost);
router.get('/:id', controller.getPost);
router.put('/:id', controller.putPost);
router.post('/validate-edit/:id', controller.validateEdit);
router.delete('/:id', controller.deletePost);

module.exports = router;
