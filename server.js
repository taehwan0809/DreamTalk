const express = require('express');
const app = express();
const db = require('./models');
const {DataTypes } = require('sequelize');

app.get('/', async(req,res) => {
    try{
        await db.sequelize.authenticate();
        console.log("연결 성공");
    } catch(error){
    console.error('연결 실패', error)
    }

})



// db.sequelize.sync().then(()=>{
//     console.log('db 연결 성공')
// })
// .catch(err => console.log(err));


const Posts = db.sequelize.define('posts', {
    post_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    user_id: {type: DataTypes.INTEGER, allowNull: false},
    title: {type: DataTypes.STRING(255), allowNull:false},
    content: {type: DataTypes.TEXT, allowNull:false},
    image_url: {type: DataTypes.STRING(500)},
    category: {type: DataTypes.STRING(50)}
    },{
        timestamps: false,
        createdAt: 'created_at',
        updatedAt: false
    })

// posts 테이블 선언

const Users = db.sequelize.define('users', {
    user_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    email: {type: DataTypes.STRING(255), allowNull:false, unique: true},
    password: {type: DataTypes.STRING(255), allowNull:false},
    nickname: {type: DataTypes.STRING(50), allowNull:false}
    }, {
        timestamps: false
    });

// users 테이블 선언

Users.hasMany(Posts, {foreignKey: 'user_id'});
Posts.belongsTo(Users, {foreignKey: 'user_id'});
// foreignKey 연결

const Comments = db.sequelize.define('comments', {
    comment_id:{type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true, allowNull: false },
    post_id: {type: DataTypes.INTEGER, allowNull:false},
    user_id: {type: DataTypes.INTEGER, allowNull: false},
    content: {type: DataTypes.TEXT, allowNull:false}
}, {
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
})
// comments 테이블 선언

app.use(express.static(__dirname + '/public'));
// css 사용

app.set('view engine', 'ejs');
// ejs 세팅

app.listen(8080, ()=>{
    console.log('http://localhost:8080 에서 실행')
})


