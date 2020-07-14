const mongoose = require('mongoose');
const bcrypt = require('bcrypt');                               // 암호화
const saltRounds = 10                                           // ~10 hashes/sec
const jwt = require('jsonwebtoken');                            // 토큰 (로그인)

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})


userSchema.pre('save', function (next) {                          // userSchema를 하기 전에 이걸 먼저 하게 한다, index.js의 'save'에다가 'next'를 보낼거다
    var user = this;                                              // userSchema를 'user'에 넣는다

    //비밀번호 암호화
    if (user.isModified('password')) {                                // password르 바꿀때만 암호화, email 바꿀땐 실행 No
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)
                
                bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {


    // plainPassword와 암호된 패스워드를 비교해야한다, plainPassword도 암호화시켜야 한다
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}


// 토큰으로 누군지 알수가 있다
userSchema.methods.generateToken = function (cb) {                    // 토큰을 만들기 위해, generateToken 매쏘드를 만든다, 이건 index js에서 쓰인다
    var user = this;
    // jsonwebtoken
    var token = jwt.sign(user._id.toHexString(), 'secretToken')                // user._id + 'secretToken'로 바꿔줌
    // user._id + 'secretToken' = token;
    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}



const User = mongoose.model('User', userSchema)         // 모델이 스키마를 감싼다

module.exports = { User }                               // 이 모델을 다른곳에서 사용하도록