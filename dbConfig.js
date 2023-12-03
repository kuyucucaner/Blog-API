// dbconfig.js
const dotenv = require('dotenv');
dotenv.config();

const config = {
  server: process.env.DB_SERVERNAME,
  database: process.env.DB_NAME,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};


module.exports = config;