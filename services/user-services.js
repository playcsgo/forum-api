const { User } = require('../models')
const bcrypt = require('bcryptjs')

const userServices = {
  signUpPage: (req, cb) => {
    cb(null)
  },
  signInPage: (req, cb) => {
    cb()
  },
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Password do not match!')
    return User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // return 給下面的.then用
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(user => {
        // req.flash('success_message', '註冊成功')
        cb(null, { user })
      })
      .catch(err => cb(err))
  },
  signIn: (req, cb) => {
    // req.flash('success_messages', '成功登入')
    cb()
  }
}

module.exports = userServices
