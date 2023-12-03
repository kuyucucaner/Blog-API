const dbConfig = require('../dbConfig');
const mssql = require('mssql');

const Post = {
    //POST
    createPost: async function (post) {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('userId', mssql.Int, post.userId)
                .input('title', mssql.NVarChar, post.title)
                .input('contentText', mssql.NVarChar, post.contentText)
                .input('timestamp', mssql.Date, post.timestamp || new Date())
                .input('isPublished', mssql.Bit, post.isPublished)
                .query('INSERT INTO Posts (UserID , Title , ContentText, Timestamp, IsPublished) VALUES (@userId , @title,@contentText,@timestamp,@isPublished)');
            console.log('Post Information : ', result);
            mssql.close();
        }
        catch (err) {
            console.error('Error : ', err);
        }
    },
    //GET
    getAllPosts: async function () {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request().query('SELECT * FROM Posts');
            mssql.close();
            return result.recordset;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    getPostById: async function (postId) {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('id', mssql.Int, postId)
                .query('SELECT * FROM Posts WHERE ID = @id');


            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error:', err);
            throw err;
        } finally {
            mssql.close();
        }
    },
    getUnpublishedPosts: async function () {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM Posts WHERE IsPublished = 0');
                return result.recordset;

        } catch (err) {
            console.error('Error:', err);
            throw err;
        }
        finally {
            mssql.close();
        }
    },
    getPublishedPosts: async function () {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .query('SELECT * FROM Posts WHERE IsPublished = 1');
            
            return result.recordset;
        } catch (err) {
            console.error('Error:', err);
            throw err;
        } finally {
            mssql.close();
        }
    },
    //DELETE
    deletePost: async function (postId) {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('id', mssql.Int, postId)
                .query('DELETE FROM Posts WHERE ID = @id');
            console.log('Delete result:', result);
            mssql.close();
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    //UPDATE
    updatePost: async function (postId, updatedFields) {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('id', mssql.Int, postId)
                .input('title', mssql.NVarChar, updatedFields.title)
                .input('contentText', mssql.NVarChar, updatedFields.contentText)
                .query('UPDATE Posts SET ContentText = @contentText, Title = @title WHERE ID = @id');
            console.log('Güncelleme sonucu:', result);
        } catch (err) {
            console.error('Güncelleme hatası:', err);
            throw err;
        } finally {
            mssql.close();
        }
    },
    updatePostPublishedStatus: async function(postId , isPublished){
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('id', mssql.Int, postId)
                .input('isPublished', mssql.Bit, isPublished)
                .query('UPDATE Posts SET IsPublished = @isPublished WHERE ID = @id');
            return { success: true, message: 'Post status successfully updated.'};
        } catch (err) {
            console.error('Error:', err);
            return { success: false, error: 'An error occurred, post status could not be updated.' };
        }finally{
            mssql.close();
        }
    }
}
module.exports = Post;

