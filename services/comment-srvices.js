const { Comment, User, Restaurant } = require('../models')

const commentService = {
  postComment: (req, cb) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment要填喔')
    // 空白comment沒有.trim()處理
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error('沒這人')
        if (!restaurant) throw new Error('沒這間還想留言')
        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .then(createdcomment => cb(null, { createdcomment }))
      .catch(err => cb(err))
  }
}

module.exports = commentService
