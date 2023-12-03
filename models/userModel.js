const dbConfig = require('../dbConfig');
const mssql = require('mssql');
const bcrypt = require('bcrypt');


const User = {
    createUser : async function (user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
            .input('userName' , mssql.NVarChar , user.userName)
            .input('password', mssql.NVarChar, hashedPassword)
            .input('email' , mssql.NVarChar , user.email)
            .input('isAdmin' , mssql.Bit , user.isAdmin)
            .query('INSERT INTO Users (UserName , Password , Email , IsAdmin) VALUES (@userName , @password , @email , @isAdmin)');
            console.log('User Information : ' , result);
            mssql.close();
        }
        catch(err){
            console.error('Error : ', err);
        }
    },
    getAllUsers: async function () {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request().query('SELECT * FROM Users');
            mssql.close();
            return result.recordset;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    getUserById: async function (userId) {
        try {
            const pool = await mssql.connect(dbConfig);
            const result = await pool.request()
                .input('id', mssql.Int, userId)
                .query('SELECT * FROM Users WHERE ID = @id');
    
            if (result.recordset.length > 0) {
                const user = result.recordset[0];
                return user;
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error:', err);
            throw err;
        } finally {
            mssql.close(); // Finally bloğunda bağlantıyı kapat
        }
    },
    
}

module.exports = User;