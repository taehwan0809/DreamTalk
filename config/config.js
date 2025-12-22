const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    development:{
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.PORT,
        dialect: 'mysql',
        timezone: "+09:00",
        dialectOptions:{
            timezone: "+09:00",
        }
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.PORT,
        dialect: 'mysql',
        timezone: "+09:00",
        dialectOptions:{
            timezone: "+09:00",
        }
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.PORT,
        dialect: 'mysql',
        timezone: "+09:00",
        dialectOptions:{
            timezone: "+09:00",
        }
    }
}