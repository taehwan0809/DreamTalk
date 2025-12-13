const Sequelize = require('sequelize');
const config = require('../config/config');
const env = 'development'; 
const dbconfig = config[env] //config.js development 설정
const s3config = config




const sequelize = new Sequelize(
  dbconfig.database,
  dbconfig.username,
  dbconfig.password,
  dbconfig
);


const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;



