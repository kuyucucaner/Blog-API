const { check, validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbConfig = require('../dbConfig');
const mssql = require('mssql');


const userController = {
    postCreateUser: [
        check('userName').isLength({ min: 3 }).withMessage('Username must be at least 3 characters along!'),
        check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters along!'),
        check('email').isEmail().withMessage('Invalid email format!'),
        async function (req, res) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                await userModel.createUser(req.body);
                return res.status(201).json({ message: 'User created successfully!' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    ],    
    login: async function (req, res)  {
        try {
            const { userName, password } = req.body;
            console.log('Login Request:', { userName, password });
            const pool = await mssql.connect(dbConfig);
            const request = pool.request();
            const result = await request
                .input('userName', mssql.NVarChar, userName)
                .query('SELECT * FROM Users WHERE UserName = @userName');
            console.log('Database Result:', result);
            if (result.recordset.length === 0) {
                console.log('Invalid credentials for user:', userName);
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const user = result.recordset[0];
            console.log('User Information:', user);
            if (!bcrypt.compareSync(password, user.Password)) {
                console.log('Invalid password for user:', userName);
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ ID: user.ID, userName: user.UserName  , isAdmin: user.IsAdmin}, 'monster', { expiresIn: '1h' });
            console.log("ID : ", user.ID + "username : " , user.UserName);
            res.cookie('token', token, { httpOnly: true, secure: true });
            console.log('Login successful for user:', userName);
            res.json({ message: 'Login successful', token });
        } catch (error) {
                console.error('Login Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getAllUsersController: async function (req, res) {
        try {
          const users = await userModel.getAllUsers();
          console.log(users); 
          return res.json({ users });

        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      },
      getUserByIdController: async function (req, res) {
        try {
            const userId = req.params.id; // URL'den userId'yi al
            const user = await userModel.getUserById(userId);
            console.log('user ıd : ' , userId);
            if (user) {
                return res.json({ user });
            } else {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı' , user });
            }
        } catch (error) {
            console.error('getUserByIdController Error:', error);
    
                return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}



module.exports = userController;