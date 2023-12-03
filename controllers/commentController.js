const { check, validationResult } = require('express-validator');
const commentModel = require('../models/commentModel');
const authService = require('../services/authService');

const Comment = {
    //POST
    postCreateComment:[
        authService.authenticateToken,
        check('contentText').isLength({ min: 3 }).withMessage('Content Text cannot be empty!'),
        async function (req,res){
            const userId = req.user.ID;
            const { postId, contentText } = req.body;
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                console.log('Validation Errors :', errors.array());
                return res.status(400).json({errors : errors.array()});
            }
            try {
                console.log('Creating Post', req.body);
                await commentModel.createComment({ userId, postId, contentText , timestamp: new Date()});
                console.log('Comment created succesfully!');
                return res.status(201).json({message : 'Comment created succesfully!'});
            } catch (error) {
                console.error('Create Post Error:' ,error);
                return res.status(500).json({message : 'Internal Server Error'});
            }
        }
    ],
    //GET
    getAllCommentsController: async function (req, res) {
        try {
          const comments = await commentModel.getAllComments();
          console.log(comments); 
          return res.json({ comments });

        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      },
      getCommentByIdController: async function (req, res) {
        try {
            const commentId = req.params.id; // URL'den userId'yi al
            const comment = await commentModel.getCommentById(commentId);
            console.log('user ıd : ' , commentId);
            if (comment) {
                return res.json({ comment });
            } else {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı' , comment });
            }
        } catch (error) {
            console.error('getUserByIdController Error:', error);
    
                return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
   // DELETE
   deleteCommentController: [
    authService.authenticateToken,
    async function (req, res) {
        try {
            const commentIdToDelete = req.params.id;
            console.log('Deleting comment with ID:', commentIdToDelete);

            // İlgili yorumun sahibini ve kullanıcıyı kontrol et
            const comment = await commentModel.getCommentById(commentIdToDelete);
            if (!comment) {
                return res.status(404).json({ success: false, error: 'Comment not found.' });
            }

            // Kullanıcının yorumun sahibi olup olmadığını kontrol et
            const isUserOwner = comment.userId === req.user.id;

            // Admin değilse ve kullanıcı yorumun sahibi değilse, yetkilendirme hatası döndür
            if (!req.user.isAdmin && !isUserOwner) {
                console.log('Unauthorized Attempt to Delete Comment - User:', req.user.id);
                return res.status(403).json({ success: false, error: 'You are not authorized to delete this comment.' });
            }

            // Yorumu sil
            await commentModel.deleteComment(commentIdToDelete);

            return res.json({ success: true, message: 'Comment successfully deleted.' });
        } catch (err) {
            console.error('Comment deletion error:', err);
            return res.status(500).json({ success: false, error: 'An error occurred, comment could not be deleted.' });
        }
    },
],

    //UPDATE
    updateCommentController: [
        authService.authenticateToken,
        async function (req, res) {
            try {
                const commentId = req.params.id;
                const { contentText } = req.body;
    
                // Ek olarak, bu comment'in kullanıcının mı olduğunu ve admin olup olmadığını kontrol edin
                const comment = await commentModel.getCommentById(commentId);
                if (!comment) {
                    return res.status(404).json({ success: false, error: 'Comment not found.' });
                }
                const isUserOwner = comment.userId === req.user.id;
                const isAdmin = req.user && req.user.isAdmin ? req.user.isAdmin : false;
                console.error('Owner : ', isUserOwner, 'Admin : ', isAdmin);
                if (!isUserOwner && !isAdmin) {
                    return res.status(403).json({ success: false, error: 'You are not authorized to update this comment.' });
                }
    
                await commentModel.updateComment(commentId, { contentText });
                res.json({ success: true, message: 'Comment successfully updated.' });
            } catch (error) {
                console.error('Update error:', error);
                res.status(500).json({ success: false, error: 'An error occurred, comment could not be updated.' });
            }
        },
    ],
    
}
module.exports = Comment;