const { check, validationResult } = require('express-validator');
const postModel = require('../models/postModel');
const authService = require('../services/authService');

const Post = {
    //POST
    postCreatePost: [
        authService.authenticateToken,
        check('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long!'),
        check('contentText').isLength({ min: 3 }).withMessage('Content Text cannot be empty!'),
        async function (req, res) {
            const userId = req.user.ID;
            console.log('Create Post Request:', req.body);
            req.body.userId = userId;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation Errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                console.log('Creating Post:', req.body);
                await postModel.createPost(req.body);
                console.log('Post created successfully!');
                return res.status(201).json({ message: 'Post created successfully!' });
            } catch (error) {
                console.error('Create Post Error:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    ],
    //GET
    getAllPostsController: async function (req, res) {
        try {
            const posts = await postModel.getAllPosts();
            console.log(posts);
            return res.json({ posts });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getPublishedPostsController: async function (req , res){
        try {
            const posts = await postModel.getPublishedPosts();
            console.log(posts);
            return res.json({ posts });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getUnpublishedPostsController: async function (req , res){
        try {
            const posts = await postModel.getUnpublishedPosts();
            console.log(posts);
            return res.json({ posts });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getPostByIdController: async function (req, res) {
        try {
            const postId = req.params.id;
            const post = await postModel.getPostById(postId);
            console.log('post id : ', postId);
            if (post) {
                return res.json({ post });
            }
            else {
                return res.status(404).json({ message: 'Post bulunamadı ', post });
            }
        }
        catch (error) {
            console.error('getUserByIdController Error : ', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    //DELETE
    deletePostController: [
        authService.authenticateToken,
        async function (req, res) {
            try {
                const postIdToDelete = req.params.id;
                console.log('Deleting post with ID:', postIdToDelete);
    
                // İlgili gönderinin sahibini ve kullanıcıyı kontrol et
                const post = await postModel.getPostById(postIdToDelete);
                if (!post) {
                    return res.status(404).json({ success: false, error: 'Post not found.' });
                }
    
                // Kullanıcının post'un sahibi olup olmadığını kontrol et
                const isUserOwner = post.userId === req.user.id;
    
                // Admin değilse ve kullanıcı post'un sahibi değilse, yetkilendirme hatası döndür
                if (!req.user.isAdmin && !isUserOwner) {
                    console.log('Unauthorized Attempt to Delete Post - User:', req.user.id);
                    return res.status(403).json({ success: false, error: 'You are not authorized to delete this post.' });
                }
    
                // Post'u sil
                await postModel.deletePost(postIdToDelete);
    
                return res.json({ success: true, message: 'Post successfully deleted.' });
            } catch (err) {
                console.error('Post deletion error:', err);
                return res.status(500).json({ success: false, error: 'An error occurred, post could not be deleted.' });
            }
        },
    ],
    

    //UPDATE
    updatePostController: [
        authService.authenticateToken,
        async function (req, res) {
            try {
                const postId = req.params.id;
                const { title , contentText } = req.body;

                // Ek olarak, bu comment'in kullanıcının mı veya adminin mi olduğunu kontrol edin
                const post = await postModel.getPostById(postId);
                if (!post) {
                    return res.status(404).json({ success: false, error: 'Comment not found.' });
                }
                const isUserOwner = post.userId === req.user.id;
                if (!req.user.isAdmin && !isUserOwner) {
                    return res.status(403).json({ success: false, error: 'You are not authorized to update this post.' });
                }
                await postModel.updatePost(postId, { title , contentText });
                res.json({ success: true, message: 'Comment successfully updated.' });
            } catch (error) {
                console.error('Update error:', error);
                res.status(500).json({ success: false, error: 'An error occurred, comment could not be updated.' });
            }
        },
    ],
    updatePublishedStatusController: [
        authService.authenticateToken,
        async function (req, res) {
            try {
                const postId = req.params.id;
                const { isPublished } = req.body;

                if (typeof isPublished === 'undefined') {
                  return res.status(400).json({ success: false, error: 'isPublished field is missing in the request body.' });
                }
                const updatedIsPublished = isPublished === "false" || isPublished === null ? false : isPublished.toLowerCase() === "true";
                const result = await postModel.updatePostPublishedStatus(postId, updatedIsPublished);
                console.log("post id" , postId);
                console.log("is published" , isPublished);
                if (result.success) {
                    res.json(result);
                } else {
                    res.status(500).json(result);
                }
            } catch (error) {
                console.error('Update error:', error);
                res.status(500).json({ success: false, error: 'An error occurred, post status could not be updated.' });
            }
        },
    ],
    


}
module.exports = Post;