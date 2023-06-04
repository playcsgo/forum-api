const { User, Restaurant, Comment, Favorite, Like, Followship } = require('../models')
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
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      // 要先反查是否已經加入了, 已經有就跳出
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('沒這間')
        if (favorite) throw new Error('是要加幾次?')
        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(createdFavorite => cb(null, { createdFavorite }))
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error('刪空氣?')
        return favorite.destroy()
      })
      .then(removedFavorite => {
        req.flash('success_message', '已移除我的最愛')
        cb(null, { removedFavorite })
      })
      .catch(err => cb(err))
  },
  addLike: (req, cb) => {
    const restaurantId = Number(req.params.restaurantId)
    const userId = req.user.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: { userId, restaurantId }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error('加空氣?')
        if (like) throw new Error('要like幾次?')
        return Like.create({ userId, restaurantId })
      })
      .then(createLike => cb(null, { createLike }))
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    const restaurantId = Number(req.params.restaurantId)
    const userId = req.user.id
    return Like.findOne({
      where: {
        restaurantId,
        userId
      }
    })
      .then(like => {
        if (!like) throw new Error('刪空氣?')
        return like.destroy()
      })
      .then(removedLike => cb(null, { removedLike }))
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
    // 使用const result = xxxx  而不直接拿回傳users做處理 可以保留原始的資料
      .then(users => {
        const result = users.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)
        cb(null, { users: result })
      })
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    return Promise.all([
      User.findByPk(req.params.userId),
      Followship.findOne({
        where: {
          followerId: req.user.id, // 自己就是A
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('沒這人')
        if (followship) throw new Error('跟蹤狂喔')
        return Followship.create({
          followerId: req.user.id,
          followingId: req.params.userId
        })
      })
      .then(createdFollowship => cb(null, { createdFollowship }))
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error('刪空氣?')
        return followship.destroy()
      })
      .then(removedFollow => cb(null, { removedFollow }))
      .catch(err => cb(err))
  }
}

module.exports = userServices
