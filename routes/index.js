var express = require('express');
const userController = require('../controllers/userController');
var router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  
  
});
//LOGİN & REGİSTER
router.post('/login', userController.login);
router.post('/signup', userController.postCreateUser);

//GET
router.get('/posts', postController.getAllPostsController);
router.get('/posts/published', postController.getPublishedPostsController);
router.get('/posts/unpublished', postController.getUnpublishedPostsController);
router.get('/posts/:id', postController.getPostByIdController);
router.get('/comments', commentController.getAllCommentsController);
router.get('/comments/:id', commentController.getCommentByIdController);
router.get('/users', userController.getAllUsersController);
router.get('/users/:id', userController.getUserByIdController);
//POST 
router.post('/post' , postController.postCreatePost);
router.post('/comment' , commentController.postCreateComment);
//DELETE
router.delete('/post/:id', postController.deletePostController);
router.delete('/comment/:id', commentController.deleteCommentController);

//UPDATE
router.post('/post/:id', postController.updatePostController);
router.post('/post/:id/published' ,postController.updatePublishedStatusController);
router.post('/comment/:id', commentController.updateCommentController);








module.exports = router;
