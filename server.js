const express = require('express');
const app = express();
const db = require('./models');
const {DataTypes, where } = require('sequelize');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const {S3Client} = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new S3Client({
    region: 'ap-northeast-2',
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}
})

const upload = multer({
    storage: multerS3({
        s3:s3,
        bucket: process.env.AWS_S3_BUCKET,
        key:function(req,file,cb){
            cb(null, Date.now().toString())
        }
    })
})

const store = new SequelizeStore({
    db: db.sequelize,
    tableName: 'Sessions',
})


store.sync();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// req.body를 받기 위한 코드


// 브라우저가 localhost:8080을 막지 않도록 하기 위한 코드
app.use(passport.initialize());
app.use(session({
    secret: process.env.SESSION_PW,
    resave: false,
    saveUninitialized : false,
    cookie: {maxAge:60 * 60 * 1000},
    store: store
}))
app.use(passport.session());




app.listen(8080, ()=>{
    console.log('http://localhost:8080 에서 실행')
})

app.use(express.static(__dirname + '/public'));
// css 사용

app.set('view engine', 'ejs');
// ejs 세팅


db.sequelize.authenticate().then(()=>console.log("연결 성공"))
.catch(error=>console.error('연결 실패', error))




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



passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true},
        async (req, id, pw, cb) => {
            try{
                const nickname = req.body.nickname;
                let result = await Users.findOne({where:{
                    nickname: nickname,
                    email: id,
                }})
                if(!result){
                    return cb(null, false, {message: '아이디나 email 다시 확인'})
                }

                if(await bcrypt.compare(pw, result.password)){
                    return cb(null, result)
                }else{
                    return cb(null, false, {message:'비번 틀림'})
                }
            }catch(err){
                console.error(err)
            }
    }
))

passport.serializeUser((user,done)=>{
    process.nextTick(()=>{
        done(null, {user_id:user.user_id, email:user.email})
    })
})


passport.deserializeUser(async(user,done)=>{
    let result = await Users.findOne({where:{user_id:user.user_id}})
    delete result.password
    process.nextTick(() => {
        done(null, result)
    })
})

function nullCheck(req,res,next){
    
    if(req.body.email == '' || req.body.nickname =='' || req.body.password == ''){
        res.send("<script>alert('공백 칸 입니다.'); window.location.replace('/sign');</script>")
    }
    next()

}
function nullCheck2(req,res,next){
    if(req.body.email == '' ||  req.body.nickname =='' || req.body.password == ''){
        res.send("<script>alert('공백 칸 입니다.'); window.location.replace('/login');</script>")
    }
    next()

}


app.get('/', async(req,res) => {
    res.render('main.ejs')
})


app.get('/sign', async(req,res)=>{
    res.render('sign.ejs');
})
app.post('/sign', nullCheck, async(req,res)=>{
    try{
        const emailCheck = await Users.findOne({where:{email: req.body.email}})
        const nicknameCheck = await Users.findOne({where:{nickname: req.body.nickname}})
        if(!emailCheck){
            if(!nicknameCheck){
                let hash = await bcrypt.hash(req.body.password,10)
                await Users.create({email: req.body.email, nickname: req.body.nickname, password: hash})
                .then(()=>{
                    res.redirect('/')
                })
            }else{
                res.send("<script>alert('nickname이 이미 존재합니다'); window.location.replace('/sign');</script>")    
            }
        }else{
            res.send("<script>alert('email이 이미 존재합니다'); window.location.replace('/sign');</script>")
        }
        }catch(err){
            console.error(err)
        }
})
// 회원가입

app.get('/login', async(req,res)=>{
    res.render('login.ejs')
})
app.post('/login',nullCheck2, async(req,res,next)=>{
        passport.authenticate('local', (error,user,info)=>{
        if(error) return res.status(500).json(error)
        if(!user) return res.status(401).json((info.message))
        req.logIn(user, (err) =>{
            if(err) return next(err)
                res.redirect('/')
        })
    })(req,res,next)
})
// 로그인

app.get('/list', async(req,res)=>{
    const listPost = await Posts.findAll()
    const user = req.user ? req.user.user_id : null;
    res.render('list.ejs', {posts:listPost, user:user})
})
// 게시글 리스트

app.get('/detail/:id', async(req,res)=>{
    let post = await Posts.findOne({where:{post_id: req.params.id}})
    res.render('detail.ejs', {detailPost:post})
})
// 상세 페이지



app.delete('/delete', async(req,res)=>{
    await Posts.destroy({where:{post_id:req.query.docid}});
    res.json({msg:'삭제 성공'})
})
// 삭제


app.get('/write', async(req,res)=>{
    res.render('post.ejs')
})
app.post('/write',upload.single('img'), async(req, res) => {

    try{
    if(!req.user){
        res.send('로그인 먼저 해주세요')
    }else{
        if(!req.file){
        await Posts.create({title: req.body.title, content: req.body.content,user_id: req.user.user_id, image_url: null});
        console.log("성공")
        res.redirect('/')
        }else{
        await Posts.create({title: req.body.title, content: req.body.content,user_id: req.user.user_id, image_url: req.file.location});
        console.log("성공")
        res.redirect('/')
        }
    }
    }catch(error){
        console.error(error)
    }
})
// 게시글 전송

app.get('/update/:id', async(req,res)=>{
    const list = await Posts.findOne({post_})
    res.render('update.ejs', {posts:list})
})

app.put('/update/:id', async(req,res)=>{
    await Posts.update({title:req.body.title, content:req.body.content},{where:{post_id: req.params.id}})
})
