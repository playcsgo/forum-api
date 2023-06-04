// const bcrypt = require('bcryptjs')
const { User, Like, Followship } = require('../../models')
const userServices = require('../../services/user-services')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_message', '註冊成功')
      res.redirect('/signin')
    })
  },
  signInPage: (req, res, next) => {
    userServices.signInPage(req, (err, data) => err ? next(err) : res.render('signin'))
  },
  signIn: (req, res, next) => {
    userServices.signIn(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功登入')
      res.redirect('/restaurants')
    })
  },
  logout: (req, res, next) => {
    userServices.logout(req, (err, data) => {
      if (err) return next(err)
      // flash出不來
      req.flash('success_messages', '你已成功登出')
      res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.render('users/profile', { user: data.user, comments: data.comments }))
  },
  editUser: (req, res, next) => {
    userServices.editUser(req, (err, data) => err ? next(err) : res.render('users/edit', data))
  },
  putUser: (req, res, next) => {
    userServices.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料編輯成功')
      res.redirect(`/users/${data.updatedUser.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_message', '已移除我的最愛')
      res.redirect('back')
    })
  },
  addLike: (req, res, next) => {
    userServices.addLike(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeLike: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => (err))
  },
  getTopUsers: (req, res, next) => {
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
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  // 追蹤功能
  addFollowing: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
