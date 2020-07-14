const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');          // body 데이터를 분석 후, req.body로 출력
const cookieParser = require('cookie-parser');      // 쿠키에 토큰 저장 위한 라이브러리

const config = require('./config/key');

const { User } = require("./model/User")            

app.use(bodyParser.urlencoded({extended: true}));      // application/x-www-form-urlencoded  로 된 데이터를 분석해서 가져오도록 한다
app.use(bodyParser.json());                            // json 타입으로 된 것들을 가져오도록 한다
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

  
app.get('/', (req, res) => res.send('Hello World test 243344 <h1>큰글씨</h1> '))

app.post('/api/users/register', (req, res) => {                         // 회원가입 위한 router. route의 end point는 'register' , callback function (req, res)
  // 회원가입시 필요한 정보들을 Client에서 가져오면, 그걸 database에 넣어준다
  // Model (users.js)를 가져와야 한다
  const user = new User
  (req.body)                             // Client 정보를 받아서 저장
  user.save((err, userInfo) => {                               // mongoDB 매쏘드,  콜백은 에러 확인을 위해
    if (err) return res.json({success: false, err})            // err가 있다면 json 형태로 잘못됬다고 err를 Client에게 보냄
    return res.status(200).json({success: true})              // status(200)은 성공 표시 - hppt상태 코드중 하나
  })
})   

app.post('/api/users/login', (req, res) => {

  const user = new User(req.body)
  //요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
  })
  // 이메일이 있으면 비밀번호도 확인
  user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)                                                      // 비밀번호가 같지 않다면
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
    })
  // 둘다 통과시, 토큰을 생성                                             // jsonwebtoken 라이브러리 다운로드
  user.generateToken((err, user) => {
    if (err) return res.status(400).send(err);

    //토큰을 저장 (위치: 쿠키 or 로컬스토리지 or 세션)
        res.cookie("x_auth", user.token)                         // F12 누르면 쿠키에 X_auth = #RRFQ#F!@F... 이런식으로 보인다
        .status(200)                                             // 성공
        .json({ loginSuccess: true, userId: user._id })           // json으로 데이터 전송
  })

})




app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))