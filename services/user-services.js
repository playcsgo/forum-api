const { User, Restaurant, Comment } = require('../models')
const bcrypt = require('bcryptjs')
const { imgurFileHandler } = require('../helpers/file-helpers')

const userServices = {
  signUpPage: (req, cb) => {
    cb(null)
  },
  signInPage: (req, cb) => {
    cb(null)
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
    cb(null)
  },
  logout: (req, cb) => {
    req.flash('success_messages', '你已成功登出')
    req.logout(err => {
      if (err) console.error(err)
    })
    return cb(null)
  },
  getUser: (req, cb) => {
    return Promise.all([
      User.findByPk(req.params.id, {
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      }),
      Comment.findAndCountAll({
        include: Restaurant,
        where: { user_id: req.params.id },
        nest: true,
        raw: true
      })
    ])
      .then(([user, comments]) => {
        user = {
          ...user.toJSON(),
          favoritedCount: user.FavoritedRestaurants.length,
          followingsCount: user.Followings.length,
          followersCount: user.Followers.length
        }
        cb(null, { user, comments })
      })
      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('沒這人')
        cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    if (req.user.id !== Number(req.params.id)) throw new Error('不要改別人的')
    const { name } = req.body
    const { file } = req
    if (!name) throw new Error('name要填')
    return Promise.all([
      imgurFileHandler(file),
      User.findByPk(req.user.id)
    ])
      .then(([filePath, user]) => {
        if (!user) throw new Error('見鬼了')
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(updatedUser => {
        req.flash('success_messages', '使用者資料編輯成功')
        cb(null, { updatedUser })
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
